import type { Signal } from "./signal.ts"

export interface IEffect {
  run(): void
  dispose(): void
}

type EffectFn = (() => () => void) | (() => void)

type Dependency = {
  unsubscribe(listener: IEffect): void
}

class Effect implements IEffect {
  #fn: EffectFn

  #cleanup: (() => void) | null = null
  #disposed = false

  #sources = new Set<Dependency>()

  constructor(effect: EffectFn) {
    this.#fn = effect
  }

  run = () => {
    if(this.#disposed) return

    if(this.#cleanup != null) {
      this.#cleanup()
      this.#cleanup = null
    }

    this.#sources.forEach((source) => source.unsubscribe(this))
    this.#sources.clear()

    pushEffect(this)

    const result = this.#fn()

    popEffect()

    if(typeof result === 'function') {
      this.#cleanup = result
    }
  }

  dispose = () => {
    if(this.#disposed) return

    this.#disposed = true

    if(this.#cleanup != null) {
      this.#cleanup()
      this.#cleanup = null
    }

    this.#sources.forEach((source) => source.unsubscribe(this))
    this.#sources.clear()
  }

  addSource(source: Signal<any> | Dependency) {
    this.#sources.add(source)
  }
}

const pendingEffects = new Set<IEffect | EffectFn>()

const stackEffect: (IEffect | EffectFn)[] = []

export function pushEffect(effect: Effect | EffectFn) {
  stackEffect.push(effect)
}

export function popEffect() {
  stackEffect.pop()
}

export function scheduleEffect(effect: IEffect) {
  pendingEffects.add(effect)

  queueMicrotask(() => {
    flush()
  })
}

export function flush() {
  while(pendingEffects.size > 0) {
    const batch = [...pendingEffects]

    pendingEffects.clear()

    batch.forEach((effect) => {
      if(effect instanceof Effect) {
        effect.run()
      } else if(typeof effect === 'function') {
        effect()
      }
    })
  }
}

export function getCurrentEffect() {
  return stackEffect.at(-1) ?? null
}

export function effect(effectFn: EffectFn) {
  const effect = new Effect(effectFn)

  effect.run()

  return () => effect.dispose()
}

export function isEffect(effect: unknown): effect is Effect {
  return effect instanceof Effect
}

export function invariantEffect(effect: Effect | EffectFn) {
  return isEffect(effect) ? effect.run() : effect()
}
