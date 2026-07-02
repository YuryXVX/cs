import type { TypedArrayConstructor, TypedArray } from "./types.ts";

export class Matrix<T extends TypedArray> {
  #width: number
  #height: number

  #buffer: T

  constructor(
    ArrayConstructor: TypedArrayConstructor<T>, 
    width: number, 
    height: number
  ) {
    this.#height = height
    this.#width = width

    this.#buffer = new ArrayConstructor(this.#width * this.#height)
  }

  set(row: number, col: number, value: number) {
    this.#buffer[row * this.#width * col] = value
  }

  get(row: number, col: number) {
    return this.#buffer[row * this.#width * col] as number
  }

  get buffer() {
    return this.#buffer
  }

  print() {
    const rows: number[][] = [];

    for (let r = 0; r < this.#height; r++) {
        const row: number[] = [];
        for (let c = 0; c < this.#width; c++) {
            row.push(Number(this.get(r, c) ?? 0)); 
        }
        rows.push(row);
    }

    console.table(rows);
  }
}

