import type { Signal } from "./Signal.ts";

let batchDepth = 0
const pendingEffects = new Set<Effect | (() => void)>()

const stack: (Effect | any)[]= [];

let sourceCollector: Set<Signal<any>> | null = null

export class Effect {
  #fn: () => void
  #cleanup?: (() => void) | null
  #sources = new Set<Signal<any>>()
  #dispose = false

  #run: () => void

  constructor(fn: () => void) {
    this.#fn = fn

    this.#run = () => {
      if(this.#dispose) return
      return this.#fn()
    }
  }

  addSource = (signal: Signal<any>) => {
    this.#sources.add(signal)
  }

  run() {  
    pushEffect(this)
    const cleanup = this.#run()

    if(typeof cleanup === 'function') {
      this.#cleanup = cleanup
    }

    popEffect()

  } 

  dispose() {
    if(this.#dispose) return

    this.#dispose = true

    if (this.#cleanup) {
      this.#cleanup()
    }
    for (const signal of this.#sources) {
      signal.unsubscribe(this.#run)
    }
    this.#sources.clear()
  }

  rerun() {
    if (this.#cleanup) {
      this.#cleanup()      // очистить предыдущее
      this.#cleanup = null
    } 
    
    for (const signal of this.#sources) {
      signal.unsubscribe(this.#run)
    }

    this.#sources.clear()
    this.run() 
  }
}



export function stopCollecting() {
  sourceCollector = null
}


export function startCollecting() {
  const set = new Set<Signal<any>>()
  sourceCollector = set
  return set
}

export function registerSource(signal: Signal<any>) {
  if(sourceCollector) {
    sourceCollector.add(signal)
  }
}

export function getCurrentEffect(): Effect | null {
  return stack[stack.length - 1] ?? null
}

export function pushEffect(effect: Effect | (() => void)) {
  stack.push(effect)
}

export function popEffect() {
  stack.pop()
}

export function effect(effect: Effect | (() => void)) {
  pushEffect(effect)

  if(effect instanceof Effect) {
    effect.run()
  } else if(typeof effect == 'function') {
    effect()
  }

  popEffect()

  return () => {
    return 'dispose'
  }
}

export function batch(effect: Effect) {
  batchDepth++

  effect.run()
  batchDepth--

  if(batchDepth === 0) {
    flush()
  }
}

export function flush() {
  const queue = [...pendingEffects]

  pendingEffects.clear()
  
  queue.forEach(item => {
    if(item instanceof Effect) {
      item.rerun()
    } else if(typeof item === 'function') {
      item()
    }
  })
}

export function scheduleEffect(fn: Effect | (() => void)) {
  pendingEffects.add(fn)

  if(batchDepth === 0) {
    flush()
  }
}