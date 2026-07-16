import { Matrix } from "./matrix.ts";
import type { TypedArray } from "./types.ts";

class Graph<T extends TypedArray> {
  #matrix: Matrix<T>;

  constructor(matrix: Matrix<T>) {
    this.#matrix = matrix;
  }

  get matrix() {
    return this.#matrix;
  }

  addEdge(u: number, v: number, weight = 1) {
    this.#matrix.set(u, v, weight);
    this.#matrix.set(v, u, weight);
  }

  addArc(u: number, v: number, weight = 1) {
    this.#matrix.set(u, v, weight);
  }

  hasEdge(u: number, v: number) {
    return this.#matrix.get(u, v) > 0 && this.#matrix.get(v, u) > 0;
  }

  hasArc(u: number, v: number) {
    return this.#matrix.get(u, v) > 0;
  }
}

const g = new Graph(new Matrix(Uint8Array, 4, 4));

g.addArc(0, 1); // Направленная дуга из 0 в 1
g.addEdge(1, 2); // Двустороннее ребро между 1 и 2
g.addArc(2, 3); // Направленная дуга из 2 в 3

g.matrix.print();
