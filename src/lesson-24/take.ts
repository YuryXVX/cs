export function take<T>(iterable: Iterable<T>, limit: number) {
  const iter = Iterator.from(iterable);

  return Iterator.from({
    next() {
      if (limit === 0) {
        return {
          done: true,
          value: undefined,
        };
      }

      limit--;

      return {
        done: false,
        value: iter.next().value,
      };
    },
  });
}
