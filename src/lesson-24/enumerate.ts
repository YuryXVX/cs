export function enumerate<T>(iterator: Iterable<T>) {
  const iter = Iterator.from(iterator);
  let i = 0;

  return Iterator.from({
    next() {
      const it = iter.next();

      if (it.done) return { done: true, value: undefined };

      return { done: false, value: [i++, it.value] };
    },
  });
}
