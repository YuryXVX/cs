import type { Chunk, Nullable, TypedArray, TypedArrayConstructor } from "./types.ts";

export class Dequeue<T extends TypedArray> {
  #ArrayType: TypedArrayConstructor;
  #capacity: number;
  #length: number;

  #head: Nullable<Chunk<T>>;
  #tail: Nullable<Chunk<T>>;

  constructor(type: TypedArrayConstructor, capacity: number) {
    this.#ArrayType = type;
    this.#capacity = capacity;

    this.#head = null;
    this.#tail = null;

    this.#length = 0;
  }

  #createChunk(): Chunk<T> {
    return {
      data: new this.#ArrayType(this.#capacity) as T,
      next: null,
      prev: null,
      start: 0,
      end: 0,
    }
  }

  #isChunkFull(chunk: Chunk<T>) {
    return chunk.end === this.#capacity
  }


  #removeChunk(chunk: Chunk<T>) {
    const next = chunk.next
    const prev = chunk.prev

    if(prev) {
      prev.next = next
    } else {
      this.#head = next
    }

    if (next) {
      next.prev = prev;
    } else {
      this.#tail = prev;
    }

    if(this.#length === 0) {
      this.#head = null
      this.#tail = null
    }
  }

  #isChunkEmpty(chunk: Chunk<T>) {
    return chunk.end === chunk.start
  }

  get length() {
    return this.#length
  }
 
  push(value: number): number {
    if(this.#tail == null) {
      const chunk = this.#createChunk()

      this.#head = chunk
      this.#tail = chunk
    } 

    if(this.#isChunkFull(this.#tail)) {
      const newChunk = this.#createChunk();
      newChunk.prev = this.#tail;
      this.#tail.next = newChunk;
      this.#tail = newChunk;
    }

    this.#tail.data[this.#tail.end] = value
    this.#tail.end++

    this.#length++


    return this.#length
  }


  pop() {
    if (this.#length === 0 || this.#tail === null) {
      return undefined;
    }

    const lastIndex = this.#tail.end - 1

    const value = this.#tail.data[lastIndex]

    this.#tail.data[lastIndex] = 0
    this.#tail.end--
    this.#length--


    if(this.#isChunkEmpty(this.#tail)) {
      this.#removeChunk(this.#tail)
    }

    return value
  }


  unshift(val: number) {
    if(this.#head == null) {
      const chunk = this.#createChunk()

      this.#head = chunk
      this.#tail = chunk
    }  

    if(this.#head.start === 0) {
      const newChunk = this.#createChunk();

      newChunk.start = this.#capacity;
      newChunk.end = this.#capacity;

      newChunk.next = this.#head;
      this.#head.prev = newChunk;
      this.#head = newChunk;
    }

    this.#head.start--;
    this.#head.data[this.#head.start] = val;
    this.#length++;

    return this.#length;
  }

  shift() {
    if(this.#length === 0 || this.#head == null) {
      return undefined
    }

    const firstIndex = this.#head.start

    const value = this.#head.data[firstIndex]

    this.#head.data[firstIndex] = 0;
    this.#head.start++;
    this.#length--;

    if (this.#isChunkEmpty(this.#head)) {
      this.#removeChunk(this.#head);
    }
    
    return value
  }


  toArray() {
    const result: (number | bigint)[] = []

    let ptr = this.#head 


    while(ptr !== null) {
      ptr.data.forEach(el => result.push(el))
      ptr = ptr.next
    }

    return result
  }


  isEmpty() {
    return this.#length === 0
  }

  [Symbol.iterator]() {
    let current = this.#head

    let index = current ? current.start : 0


    return {
      next: () => {
        if(current == null) {
          return { value: undefined, done: true }
        }

        const value = current.data[index]

        const result = { value, done: false }

        index++;

        if (index >= current.end) {

          current = current.next;

          if (current !== null) {
            index = current.start;
          }
        }

        return result
      }
    }
  }
}


