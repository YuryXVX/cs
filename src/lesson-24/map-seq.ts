export function mapSeq<T>(
    iterable: Iterable<T>,
    operations: Iterable<(v: T) => T>
) {
    const iter = Iterator.from(iterable)
   
    return Iterator.from({
        next() {
           const current = iter.next()

           if(current.done) return { done: true, value: undefined }

           let result = current.value

           for(const cb of operations) {
              result = cb(result)
           }

           return { done: false, value: result }
        }
    })
}