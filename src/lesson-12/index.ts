import { HeapPointer, StackPointer } from "./pointer.ts";

import type { BufferLike, HeapBlock, IMemory, MemoryBlock, MemoryOptions } from "./types.ts";


class Rc {
  #rc = {
    counter: 1
  }

  #pointer: HeapPointer
  constructor(pointer: HeapPointer, rc = null as null | number) {
    this.#pointer = pointer

    if(rc !== null) {
      this.#rc.counter++
    }
  } 

  [Symbol.dispose]() {    
    if(this.#rc.counter === 0) {
      this.#pointer.free()
    }
  }

  clone() {
    return new Rc(this.#pointer, this.#rc.counter + 1)
  }

  get memory() {
    return this.#pointer
  }
}

class Memory implements IMemory {
  #size: number

  #stackSize: number
  #stackPtr: number
  #frames: MemoryBlock[]

  #heapSize: number
  #heapPtr: number
  #allocations: Map<number, HeapBlock>
  #heapFreeBlocks: MemoryBlock[]
  
  #buffer: ArrayBuffer
  #uint8: Uint8Array

  #nextPointerId: number;


  constructor(size: number, opt: MemoryOptions) {
    this.#size = size
    this.#buffer = new ArrayBuffer(size)
    this.#uint8 = new Uint8Array(this.#buffer)

    // stack 
    this.#stackSize = opt.stack ?? 0
    this.#stackPtr = 0
    this.#frames = []

    // heap
    this.#heapSize = size
    this.#allocations = new Map()
    this.#heapFreeBlocks = []

    this.#heapPtr = this.#size

    this.#nextPointerId = 0
  }

  push(data: BufferLike) {
    const bytes = this.#getBytes(data)

    if((bytes.length + this.#stackPtr) > this.#stackSize) {
      throw new Error('Stack overflow')
    }

    this.#uint8.set(bytes, this.#stackPtr)
    
    const offset = this.#stackPtr
    const size = bytes.length

    this.#frames.push({ offset, size })

    this.#stackPtr += bytes.length

    return new StackPointer(this, offset, size)
  }

  pop() {
    if(this.#frames.length === 0) {
      throw Error('Stack underflow: stack is empty')
    }

    const block = this.#frames.pop()

    if(!block) {
      throw new Error('Error stack UB');
    }

    const start = block.offset;
    const end = block.size;

    for(let i = start; i < start + end; i++) {
      this.#uint8[i] = 0
    }

    return block;
  }

  alloc(size: number) {
    if(size < 0) {
      throw new Error('Invalid allocation size')
    }

    size = Math.ceil(size / 8) * 8

    const freeBlock = this.#findBlock(size)

    let offset = 0;

    if(freeBlock) {
      offset = freeBlock.offset

      this.#removeBlock(freeBlock)

      const remainingSize = freeBlock.size - size

      if (remainingSize >= 8) {
        this.#heapFreeBlocks.push({
          offset: freeBlock.offset + size,
          size: remainingSize
        });
      }
    } else {
      if (offset < this.#stackPtr) {
        throw new Error('Heap overflow: collision with stack');
      }

      offset = this.#heapPtr - size 
      this.#heapPtr = offset
    }


    const id = this.#nextPointerId++

    this.#allocations.set(id, {
      freed: false, 
      size, 
      offset
    })

    return new HeapPointer(id, this, offset, size)
  }

  free(id: number) {
    if(this.#allocations.has(id)) {
      const block = this.#allocations.get(id)

      if(!block) {
        throw new Error('Invalid pointer: not found');
      }

      this.#uint8.fill(0, block.offset, block.offset + block.size)

      this.#heapFreeBlocks.push({
        offset: block.offset, 
        size: block.size
      })

      this.#allocations.delete(id)

      this.#defragment()
    }
  }

  #getBytes(buf: BufferLike) {
    if(buf instanceof Uint8Array) {
      return buf
    }

    if(buf instanceof ArrayBuffer) {
      return new Uint8Array(buf)
    }

    if(ArrayBuffer.isView(buf)) {
      return new Uint8Array(buf.buffer, buf.byteOffset, buf.length)
    }


    throw Error('Data must be an ArrayBuffer or TypedArray')
  }

  read(offset: number, size: number) {
    return this.#uint8.subarray(offset, offset + size);
  }

  write(data: BufferLike, offset: number) {
    const bytes = this.#getBytes(data);

    if(offset < 0 || (offset + bytes.length) > this.#size) {
      throw new Error('Write out of bounds');
    }

    this.#uint8.set(bytes, offset)
  }

  #findBlock(size: number) {
    let bestBlock: MemoryBlock | undefined
    let bestFitSize = Infinity

    for(const block of this.#heapFreeBlocks) {
      if(block.size >= size) {
        if(block.size < bestFitSize) {
          bestBlock = block
          bestFitSize = block.size;

          if (block.size === size) {
            break;
          }
        }
      }
    }

    return bestBlock
  }

  #removeBlock(block: MemoryBlock) {
    const index = this.#heapFreeBlocks.indexOf(block);

    if (index !== -1) {
      this.#heapFreeBlocks.splice(index, 1);
    }
  }

  #defragment() {
    if(this.#heapFreeBlocks.length < 2) {
      return
    }

    this.#heapFreeBlocks.sort((a, b) => a.offset - b.offset)

    const merged = [this.#heapFreeBlocks[0]!]

    for(let i = 1; i < this.#heapFreeBlocks.length; i++) {
      const current = this.#heapFreeBlocks[i]
      const last = merged[merged.length - 1]
      
      if(last && current) {
        if(last.offset + last.size === current?.offset) {
          last.size += current.size
        } else {
          merged.push(current)
        }
      }
    }

    this.#heapFreeBlocks = merged
  }
    
  getStat() {
    const usedHeap = this.#size - this.#heapSize;
    const freeInHeap = this.#heapFreeBlocks.reduce((sum, b) => sum + b.size, 0);
    
    return {
      stackUsed: this.#stackPtr,
      stackFree: this.#stackSize - this.#stackPtr,
      heapTotal: this.#size - this.#stackSize,
      heapUsed: usedHeap - freeInHeap,
      heapFree: (this.#heapPtr - this.#stackSize) + freeInHeap,
      allocatedBlocks: this.#allocations.size,
      freeBlocks: this.#heapFreeBlocks.length,
      fragmentation: this.#heapFreeBlocks.length > 1 ? 'fragmented' : 'ok'
    };
  }
}

const mem = new Memory(10 * 100, { stack: 100 });



{
  using pointer1 = new Rc(mem.alloc(128)) 

  {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    using _ = pointer1.clone()
  } 
}
// count становится 0
console.log(mem.getStat().freeBlocks)