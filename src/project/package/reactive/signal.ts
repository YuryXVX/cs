import { isComputedInvalidate } from "./computed.ts"
import { getCurrentEffect, type IEffect, isEffect } from "./effect.ts"
import type { StreamLike } from "./stream.ts"

export type Listener<T> = (val?: T) => void

interface SignalOptions<T> {
  equal: (a?: T, b?: T) => boolean
}

export class Signal<T> {
  #value: T
  #version = 0

  #subscribers = new Set<Listener<T> | IEffect>() 
  #equalFunction: (a?: T, b?: T) => boolean

  constructor(value: T, options: SignalOptions<T>) {
    this.#value = value
    this.#equalFunction = options.equal
  }

  static fromStream<T>(stream: StreamLike<T>, initial: T, options: SignalOptions<T>) {
    const signal = new Signal<T>(initial, options)

    stream.subscribe((value) => signal.set(value))

    return signal
  }

  static toStream<T>(): StreamLike<T> {
    
  }

  get() {
    const effect = getCurrentEffect()

    if(isEffect(effect)) {
      this.#subscribers.add(effect)
      effect.addSource(this)
    }

    if(isComputedInvalidate(effect)) {
      this.#subscribers.add(effect)
    }

    return this.#value
  }

  set(value: T) {
    if(!this.#equalFunction(value, this.#value)) {
      this.#value = value

      this.#version++
      this.#subscribers.forEach(listener => {
        if(isEffect(listener)) listener.run()
        else if(isComputedInvalidate(listener)) listener()
      })
    }
  }

  get version() {
    return this.#version
  }

  subscribe(listener: Listener<T>) {
    this.#subscribers.add(listener)

    return () => {
      this.unsubscribe(listener)
    }
  }

  unsubscribe = (listener: Listener<T> | IEffect) => {
    this.#subscribers.delete(listener)
  }
}

const defaultOptions = <T>(): Required<SignalOptions<T>> => ({
  equal: (a?: T, b?: T) => Object.is(a, b)
})

export function ref<T>(val: T, options = defaultOptions()) {
  return new Signal(val, options)
}

export function from<T>(stream: StreamLike<T>, initial: T, options = defaultOptions()) {
  return Signal.fromStream<T>(stream, initial, options)
}

export function stream<T>() {
  return Signal.toStream<T>()
}