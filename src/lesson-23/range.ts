export class Range {
  #start: number;
  #end: number;
  #reversed = false;
  #isString = false;

  constructor(a: string | number, b: string | number) {
    if (typeof a !== typeof b) {
      throw Error("Different data types in arguments");
    }

    this.#isString = typeof a === "string";
    this.#start = typeof a === "string" ? a.charCodeAt(0) : a;
    this.#end = typeof b === "string" ? b.charCodeAt(0) : b;
  }

  [Symbol.iterator]() {
    let currentStart = this.#start;
    let currentEnd = this.#end;

    return {
      next: () => {
        const end = currentEnd;
        const start = currentStart;

        const current = this.#reversed ? currentEnd : currentStart;

        const isEnd = this.#reversed ? end >= start : start <= end;

        if (isEnd) {
          const value = this.#isString ? String.fromCharCode(current) : current;

          if (this.#reversed) {
            currentEnd--;
          } else {
            currentStart++;
          }

          return { value, done: false };
        }

        return {
          value: undefined,
          done: true,
        };
      },
    };
  }

  reverse() {
    this.#reversed = !this.#reversed;
    return this;
  }
}
