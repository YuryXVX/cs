export function throttle<Args extends unknown[]>(
  callback: (...args: Args) => void,
  timer: number,
) {
  let timerId: ReturnType<typeof setTimeout> | undefined = undefined;
  let nextArgs: Args | undefined;

  const wrap = function (...args: Args) {
    if (timerId != undefined) {
      nextArgs = args;

      return;
    }

    callback(...args);

    timerId = setTimeout(() => {
      timerId = undefined;

      if (nextArgs) {
        const currentArgs = nextArgs;
        nextArgs = undefined;
        callback(...currentArgs);
      }
    }, timer);
  };

  return wrap;
}
