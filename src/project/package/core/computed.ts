import { getCurrentEffect, pushEffect, popEffect } from "./effect.ts";

export type ComputedValue<T> = () => T

export class Computed<T> {
  #fn: ComputedValue<T>
  #dirty: boolean
  #firstRun: boolean

  #deps = new Set<ComputedValue<T>>()

  #cacheValue: undefined | T

  constructor(computed: ComputedValue<T>) {
    this.#fn = computed
    this.#dirty = true
    this.#firstRun = true

    this.#cacheValue = undefined
  }

  get() {
    if(this.#firstRun) {
      this.#firstRun = false
      this.track()
    }

    const currentEffect = getCurrentEffect()

    if(currentEffect) {
      this.#deps.add(currentEffect)
    }

    if(this.#dirty) {
      this.#cacheValue = this.#fn()
      this.#dirty = false
    }


    return this.#cacheValue
  }

  track() {
    const invalidate = () => {
      this.#dirty = false

      this.#deps.forEach(cb => cb())
    }

    pushEffect(invalidate)

    this.#fn()

    popEffect()
  }

}

// 1 авторизация
// 2 анализ по точкм продаж
// 3 шапка и рейтинг
// 4 ничего нет
// 5 анализ воронка и динамика