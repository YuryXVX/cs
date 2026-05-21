import type { HeapPointer, StackPointer } from "./pointer.ts";

type TypedArray = 
  | Int8Array 
  | Uint8Array 
  | Uint8ClampedArray 
  | Int16Array 
  | Uint16Array 
  | Int32Array 
  | Uint32Array 
  | Float32Array 
  | Float64Array 
  | BigInt64Array 
  | BigUint64Array;


export type BufferLike = ArrayBuffer | TypedArray;

export interface IMemory {
  push(data: BufferLike): StackPointer
  pop(): MemoryBlock

  alloc(size: number): HeapPointer
  free(id: number): void

  read(offset: number, size: number): Uint8Array
  write(data: BufferLike, offset: number): void
}

export interface MemoryOptions {
  stack?: number
}

export interface MemoryBlock {
  offset: number;
  size: number;
}

export interface HeapBlock extends MemoryBlock {
  freed: boolean
}