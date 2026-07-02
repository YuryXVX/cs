import { Matrix } from "./matrix.ts";


const matrix = new Matrix(Uint8Array, 5, 5);

matrix.set(0, 0, 3)
matrix.set(0, 2, 5)


matrix.print()

// 5, 0, 0, 0, 0
// 0  0  0, 0, 0
// 0  0  0, 0, 0
// 0  0  0, 0, 0
// 0  0  0, 0, 0