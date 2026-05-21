import type { BufferLike, IMemory } from "./types.ts";

export class Pointer {
  #memory: IMemory
  #offset: number
  #size: number

  constructor(memory: IMemory, offset: number, size: number) {
    this.#memory = memory
    this.#offset = offset
    this.#size = size
  }

  get memory() {
    return this.#memory
  }
  
  get offset() {
    return this.#offset
  }

  get size() {
    return this.#size
  }

  deref() {
    return this.#memory.read(this.#offset, this.#offset + this.size)
  }

  change(data: BufferLike) {
    if(data.byteLength > this.#size) {
      throw Error('out of bound')
    }
    
    this.#memory.write(data, this.#offset)
  }
}

export class StackPointer extends Pointer {}

export class HeapPointer extends Pointer {
  #id: number
  #contentLength: number
  #free: boolean

  constructor(
    id: number, 
    memory: IMemory, 
    offset: number, 
    size: number,
  ) {
    super(memory, offset, size)
    this.#id = id
    this.#contentLength = 0
    this.#free = false
  }

  free() {
    if(this.#free) {
      throw new Error('Double free detected')
    }

    this.#free = true
    this.memory.free(this.#id)
  }

  change(data: BufferLike): void {
    this.#contentLength = data.byteLength

    super.change(data)
  }

  deref() {
    return this.memory.read(this.offset, this.#contentLength)
  }

  [Symbol.dispose]() {
    this.memory.free(this.#id)
  }
}