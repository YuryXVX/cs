type Callback = (...params: unknown[]) => void;
type Finish = (err: unknown, ...params: unknown[]) => void;

export function waterfall(
  callbacks: Iterable<Callback>,
  finallyCallback: Finish,
) {
  const iterator = Iterator.from(callbacks);

  function next(err: unknown, ...args: unknown[]) {
    if (err !== null) {
      return finallyCallback(null, ...args);
    }

    const { value, done } = iterator.next();

    if (done || !value) {
      return finallyCallback(err, ...args);
    }

    try {
      if (value) {
        value(...args, next);
      }
    } catch {
      finallyCallback(err, ...args);
    }
  }

  next(null);
}

export async function waterfallAsync(
  callbacks: Iterable<Callback>,
  finallyCallback: Finish,
) {
  let args: unknown[] = [];

  try {
    for (const callback of callbacks) {
      args = await new Promise<unknown[]>((resolve, reject) => {
        try {
          callback(...args, (err: unknown, ...nextArgs: unknown[]) => {
            if (err !== null && err !== undefined) {
              reject({ err, args: nextArgs });
            } else {
              resolve(nextArgs);
            }
          });
        } catch (error) {
          reject({ err: error, args });
        }
      });
    }

    finallyCallback(null, ...args);
  } catch (error) {
    const finalArgs = error?.args !== undefined ? error.args : args;
    finallyCallback(null, ...finalArgs);
  }
}
