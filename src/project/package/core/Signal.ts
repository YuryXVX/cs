type Listener<T> = (val?: T) => void

function type<T>(o: T) {
  return typeof o
}

function isObject<T>(o: T) {
  return type(o) === 'object' && o !== null
}


function compare<T>(a: T, b: T) {
  if(isObject(a) && isObject(b)) {
    return Object.is(a, b)
  }

  return a !== b
}

export class Signal<T> {
  #value: T
  #subscribers = new Set<Listener<T>>()

  constructor(value: T) {
    this.#value = value
  }

  subscribe(fn: Listener<T>) {
    this.#subscribers.add(fn)
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