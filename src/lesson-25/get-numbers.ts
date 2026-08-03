// eslint-disable-next-line @typescript-eslint/naming-convention
const State = {
  Start: "start",
  Sign: "sign",
  Int: "int",
  Dot: "dot",
  Frac: "frac",
} as const;

type StateKeys = (typeof State)[keyof typeof State];

const WAIT = Symbol("wait");

export function getNumbers(initial: string) {
  let buffer = initial;
  let pointer = 0;
  let state: StateKeys = State.Start;
  let acc = "";

  function reset() {
    state = State.Start;
    acc = "";
  }

  function flush(): number {
    const num = parseFloat(acc);
    reset();
    return num;
  }

  function hasPendingNumber() {
    return (
      state === State.Int ||
      state === State.Frac ||
      (state === State.Dot && acc !== ".")
    );
  }

  function* parse(): Generator<
    number | typeof WAIT,
    never,
    string | undefined
  > {
    while (true) {
      while (pointer < buffer.length) {
        const char = buffer[pointer++]!;

        switch (state) {
          case State.Start: {
            if (char === "+" || char === "-") {
              acc = char;
              state = State.Sign;
            } else if (char >= "0" && char <= "9") {
              acc = char;
              state = State.Int;
            } else if (char === ".") {
              acc = char;
              state = State.Dot;
            }
            break;
          }

          case State.Sign: {
            if (char >= "0" && char <= "9") {
              acc += char;
              state = State.Int;
            } else if (char === ".") {
              acc += char;
              state = State.Dot;
            } else {
              reset();
              pointer--;
            }
            break;
          }

          case State.Int: {
            if (char >= "0" && char <= "9") {
              acc += char;
            } else if (char === ".") {
              acc += char;
              state = State.Dot;
            } else {
              yield flush();
              pointer--;
            }
            break;
          }

          case State.Dot: {
            if (char >= "0" && char <= "9") {
              acc += char;
              state = State.Frac;
            } else if (acc !== ".") {
              yield flush();
              pointer--;
            } else {
              reset();
              pointer--;
            }
            break;
          }

          case State.Frac: {
            if (char >= "0" && char <= "9") {
              acc += char;
            } else {
              yield flush();
              pointer--;
            }
            break;
          }
        }
      }

      if (hasPendingNumber()) {
        yield flush();
        continue;
      }

      const chunk = yield WAIT;

      if (chunk !== undefined) {
        buffer += chunk;
      }
    }
  }

  const gen = parse();
  let waiting = false;
  const pending: number[] = [];

  function pull(result: IteratorResult<number | typeof WAIT, never>) {
    while (!result.done) {
      if (result.value === WAIT) {
        waiting = true;
        return;
      }

      pending.push(result.value);

      result = gen.next();
    }
  }

  function read(): IteratorResult<number> {
    if (pending.length > 0) {
      return { value: pending.shift()!, done: false };
    }

    const result = gen.next();

    if (result.done) {
      return { value: undefined, done: true };
    }

    if (result.value === WAIT) {
      waiting = true;
      throw new Error("Поток данных иссяк. Ожидание ввода...");
    }

    return { value: result.value, done: false };
  }

  const numbers = {
    next(input?: string): IteratorResult<number> {
      if (waiting && input !== undefined) {
        waiting = false;
        pull(gen.next(input));
        return { value: undefined as never, done: false };
      }

      return read();
    },

    [Symbol.iterator]() {
      return {
        next: () => read(),
        return() {
          return { value: undefined, done: false };
        },
      };
    },
  };

  return numbers;
}
