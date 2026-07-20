export function seq(...iterators: Iterable<unknown>[]) {
  const iters = iterators.map((iter) => Iterator.from(iter));
  let index = 0;

  return Iterator.from({
    next() {
      while (index < iters.length) {
        const item = iters[index]?.next();

        if (item && !item.done) {
          return item;
        }

        index++;
      }

      return { done: true, value: undefined };
    },
  });
}
