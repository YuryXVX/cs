export function filter<T>(iterable: Iterable<T>, pred: (value: T) => boolean) {
  const iter = Iterator.from(iterable)


  return Iterator.from({
    next() {
      while(true) {
        const item = iter.next()

        if(item.done) return item

        if(pred(item.value)) return item
      }
    }
  })
}