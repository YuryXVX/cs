interface RunTaskOptions {
  threshold?: number;
  delay?: number;
}

export function runTask<T = unknown, TReturn = unknown, TNext = undefined>(
  gen: Generator<T, TReturn, TNext>,
  options: RunTaskOptions,
) {
  const { threshold = 100, delay = 500 } = options;

  let startTime = Date.now();

  let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;

  function tick() {
    while (true) {
      const elapsed = Date.now() - startTime;

      if (elapsed >= threshold) {
        timeoutId = setTimeout(() => {
          startTime = Date.now();
          tick();
        }, delay);

        return;
      }

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const { done } = gen.next();

      if (done) {
        return;
      }
    }
  }

  tick();
}
