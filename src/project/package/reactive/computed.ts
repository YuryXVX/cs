import { getCurrentEffect, isEffect, popEffect, pushEffect, scheduleEffect, type IEffect } from "./effect.ts"
import type { Listener } from "./signal.ts"

type ComputedFn<T> = () => T

export function isComputed<T>(value: unknown): value is Computed<T>  {
  return value instanceof Computed
}

export function isComputedInvalidate(value: unknown) {
  return typeof value === 'function'
}

export class Computed<T> {
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

    if(isEffect(effect)) {
      this.#subscribers.add(effect)
      effect.addSource(this)
    } else if(effect) {
      this.#subscribers.add(effect)
    }

    if(this.#firstRun) {
      this.#firstRun = false
      this.#recompute()
      return this.#cacheValue!
    }

    if(this.#dirty) {
      this.#recompute()
    }

    return this.#cacheValue!
  }

  #invalidate = () => {
    this.#dirty = true
    this.notify()
  }

  #recompute() {
    pushEffect(this.#invalidate)

    const prev = this.#cacheValue
    const next = this.#fn()

    popEffect()

    this.#dirty = false

    if(!Object.is(prev, next)) {
      this.#cacheValue = next
    }
  }

  invalidate() {
    this.#dirty = true
    this.notify()
  }

  notify() {
    const hasFnSubscriber = [...this.#subscribers].some(
      subscriber => typeof subscriber === 'function'
    )

    if(hasFnSubscriber && this.#dirty) {
      this.#recompute()
    }

    this.#subscribers.forEach(subscriber => {
      if(isEffect(subscriber)) scheduleEffect(subscriber)
      else if(isComputed<T>(subscriber)) subscriber.invalidate()
      else if(typeof subscriber === 'function') subscriber(this.#cacheValue)
    })
  }

  subscribe(listener: (val?: T) => void) {
    this.#subscribers.add(listener)

    return () => {
      this.unsubscribe(listener)
    }
  }

  unsubscribe(listener: Listener<T> | IEffect) {
    this.#subscribers.delete(listener)
  }
}

export function computed<T>(computed: ComputedFn<T>) {
  return new Computed(computed)
}
