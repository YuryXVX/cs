export function debounce<Args extends unknown[]>(
  callback: (...args: Args) => void,
  timer: number,
) {
  let timerId: ReturnType<typeof setTimeout> | undefined = undefined;

  return function (...args: Args) {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }

    timerId = setTimeout(() => {
      timerId = undefined;
      callback(...args);
    }, timer);
  };
}
