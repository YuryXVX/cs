import { Result } from "./result.ts";

export function exec(fn: () => Generator<unknown, typeof Result<unknown>>) {
  const gen = fn();

  function step(nextValue?: unknown): unknown {
    const state = gen.next(nextValue);

    if (state.done) {
      return state.value;
    }

    const currentResult = state.value;

    if (currentResult instanceof Result) {
      return currentResult.then(step).catch((unwrappedError) => {
        try {
          const nextState = gen.throw(unwrappedError);
          if (nextState.done) return nextState.value;
          return step(nextState.value);
        } catch (fatalError) {
          return new Result(() => {
            throw fatalError;
          });
        }
      });
    }
  }

  return step();
}
