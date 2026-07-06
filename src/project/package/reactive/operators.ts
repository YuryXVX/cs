import { computed, Computed } from "./computed.ts";

interface Readable<T> {
  get(): T
  subscribe(fn: (v?: T) => void): () => void
}

export function map<T, U>(signal: Readable<T>, fn: (v: T) => U): Readable<U> {
  return new LazyMap<T, U>(signal, fn)
}

export function filter<T>(
  stream: Readable<T>,
  pred: (v?: T) => boolean
): Readable<T | undefined> {
  return new LazyFilter(stream, pred)
}

class LazyMap<T, U> {
  #fn: (v: T) => U
  #source: Readable<T>
  #computed: Computed<U> | null = null

  constructor(source: Readable<T>, fn: (v: T) => U) {
    this.#fn = fn
    this.#source = source
  }

  #ensureComputed() {
    if(!this.#computed) {
      this.#computed = computed(() => this.#fn(this.#source.get()))
    }
    return this.#computed
  }

  get() {
    return this.#ensureComputed().get()
  }

  subscribe(fn: (val?: U) => void) {
    const computed = this.#ensureComputed()
    computed.get()
    return computed.subscribe(fn)
  }
}

class LazyFilter<T> {
  #pred: (v?: T) => boolean
  #source: Readable<T>
  #computed: Computed<T | undefined> | null = null

  constructor(source: Readable<T>, pred: (v?: T) => boolean) {
    this.#pred = pred
    this.#source = source
  }

  #ensureComputed() {
    if(!this.#computed) {
      this.#computed = computed(() => {
        const val = this.#source.get()
        return this.#pred(val) ? val : undefined
      })
    }
    return this.#computed
  }

  get() {
    return this.#ensureComputed().get()
  }

  subscribe(fn: (val?: T) => void) {
    const computed = this.#ensureComputed()
    computed.get()
    return computed.subscribe((val) => {
      if(val !== undefined) fn(val)
    })
  }
}
