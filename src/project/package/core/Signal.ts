type Listener<T> = (val: T) => void

function compare<T>(a: T, b: T) {
  return Object.is(a, b)
}

export class Signal<T> {
  #value: T
  #subscribers = new Set<Listener<T>>()

  constructor(value: T) {
    this.#value = value
  }

  subscribe(fn: Listener<T>) {
    this.#subscribers.add(fn)

    return () => {
      this.#subscribers.delete(fn)
    }
  }

  get() {
    return this.#value
  }

  set(newValue: T) {
    if(!compare(this.#value, newValue)) {
      this.#value = newValue
      this.#subscribers.forEach(cb => cb(newValue))
    }
  }
}