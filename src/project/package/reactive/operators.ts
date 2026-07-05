import { computed } from "./computed.ts";
import type { Signal } from "./signal.ts";
import type { StreamLike } from "./stream.ts";

interface Readable<T> {
  get(): T
  subscribe(fn: (v: T) => void): () => void
}

export function map<T, U>(signal: Signal<T>, fn: (v: T) => U) {
  return computed(() => fn(signal.get()))
}



export function filter<T>(
  stream: Readable<T>,
  pred: (v?: T) => boolean
): StreamLike<T> {
  return {
   subscribe(next) {
      const current = stream.get()

      if(pred(current)) next(current)

      const unsubscribe = stream.subscribe(() => {
        const val = stream.get()
        if (pred(val!)) return next(val!)
      })

      return {
        unsubscribe
      }
    }
  }
}
