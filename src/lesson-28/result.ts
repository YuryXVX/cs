export class Result<T> {
  #value?: T;
  #error?: unknown;

  #state: "ok" | "error";

  constructor(fn: () => T) {
    try {
      this.#value = fn();
      this.#state = "ok";
    } catch (error) {
      this.#error = error;
      this.#state = "error";
    }
  }

  then<U>(fn: (v: T) => U): Result<U> {
    if (this.#state === "ok") {
      return new Result(() => fn(this.#value!));
    }

    const errorResult = new Result<U>(() => {
      throw this.#error;
    });
    return errorResult;
  }

  catch(fn: (err: unknown) => T): Result<T> {
    if (this.#state === "error") {
      return new Result(() => fn(this.#error));
    }

    return this;
  }
}
