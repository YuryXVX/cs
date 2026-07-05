import { getCurrentEffect, isEffect, popEffect, pushEffect, scheduleEffect, type IEffect } from "./effect.ts"
import type { Listener } from "./signal.ts"

type ComputedFn<T> = () => T

export function isComputed<T>(value: unknown): value is Computed<T>  {
  return value instanceof Computed
}

export function isComputedInvalidate(value: unknown) {
  return typeof value === 'function'
}

class Computed<T> {
  #fn: ComputedFn<T>
  #cacheValue: T | undefined

  #firstRun: boolean
  #dirty: boolean

  #subscribers = new Set<IEffect | Listener<T> | Computed<T>>()

  constructor(computed: ComputedFn<T>) {
    this.#fn = computed

    this.#firstRun = true
    this.#dirty = false
  }

  get(): T {
    const effect = getCurrentEffect()

    if(effect) {
      this.#subscribers.add(effect)
    }

    if(this.#firstRun) {
      this.#firstRun = false

      this.track()

      return this.#cacheValue!
    }


    if(this.#dirty) {
      const prev = this.#cacheValue
      const next = this.#fn()
      this.#dirty = false

      if(!Object.is(prev, next)) {
        this.#cacheValue = next
      }
    }

    return this.#cacheValue!
  }


  track() {
    const invalidate = () => {
      this.#dirty = true;

      this.notify()
    }

    pushEffect(invalidate)


    this.#cacheValue = this.#fn()

    popEffect()
  }

  invalidate() {
    this.#dirty = true
    this.notify()
  }

  collectSources() {
    const invalidate = () => {
      this.#dirty = true
      this.notify()
    }

    pushEffect(invalidate)
    this.#fn()  // сигналы подписывают invalidate
    popEffect()
    // #cacheValue не трогаем, #dirty не меняем
  }

  notify() {
    this.#subscribers.forEach(subscriber => {
      if(isEffect(subscriber)) scheduleEffect(subscriber)
      else if(isComputed<T>(subscriber)) subscriber.invalidate()
      else if(typeof subscriber === 'function') subscriber(this.#cacheValue)
    })
  }

  subscribe(listener: (val?: T) => void) {
    this.#subscribers.add(listener)

    return () => {
      this.#subscribers.delete(listener)
    }
  }
}

export function computed<T>(computed: ComputedFn<T>) {
  return new Computed(computed)
}