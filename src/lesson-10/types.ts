export type TypedArray =
  | Uint8Array
  | Uint16Array
  | Uint32Array
  | Int8Array
  | Int16Array
  | Int32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array;

export type Nullable<T> =  T | null;

export interface Chunk<T = TypedArray> {
  data: T
  next: Nullable<Chunk<T>>
  prev: Nullable<Chunk<T>>

  start: number
  end: number
}

export type TypedArrayConstructor = new (cap: number) => TypedArray
