import { Effect, getCurrentEffect, popEffect, pushEffect, scheduleEffect, stopCollecting } from "./effect.ts";

export type ComputedValue<T> = () => T


export class Computed<T> {
  #fn: ComputedValue<T>
  #firstRun: boolean
  #isDirty: boolean

  #subscribers = new Set<ComputedValue<T> | Effect>()

  #cacheValue: undefined | T


  #cachedVersion = -1

  constructor(computed: ComputedValue<T>) {
    this.#fn = computed
    this.#firstRun = true
    this.#isDirty = false
    this.#cacheValue = undefined
  }

  get() {
    const currentEffect = getCurrentEffect()

    if(currentEffect) {
      this.#subscribers.add(currentEffect)
    }
    
    if(this.#firstRun) {
      this.#firstRun = false
      this.track()

      return this.#cacheValue
    }


    if(this.#isDirty) {
      const oldValue = this.#cacheValue;
      this.#cacheValue = this.#fn()

      if(!Object.is(oldValue, this.#cacheValue)) {
        this.#notify()
      }
    }

    return this.#cacheValue
  }

  track() {
    const invalidate = () => {
      this.#isDirty = true
      this.#notify()
    }

    pushEffect(invalidate)

    this.#cacheValue = this.#fn()

    popEffect()
    stopCollecting()
  }

  unsubscribe(fn: any) {
    this.#subscribers.delete(fn)
  }

  #notify() {
    this.#subscribers.forEach(scheduleEffect)
  }

  getVersion() {
    return this.#cachedVersion
  }
}

export function computed<T>(fn: ComputedValue<T>) {
  return new Computed(fn)
}