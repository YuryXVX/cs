const stack: (() => void | any)[]= [];

export function getCurrentEffect() {
  return stack[stack.length - 1] ?? null
}

export function pushEffect(effect: () => void) {
  stack.push(effect)
}

export function popEffect() {
  stack.pop()
}

export function effect(fn: () => void) {
  const run = () => fn()
  pushEffect(fn)
  run()
  popEffect()

  return () => {
    return 'dispose'
  }
}