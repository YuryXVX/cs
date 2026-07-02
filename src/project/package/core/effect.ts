const stack: (() => void)[]= [];

export function effect(fn: () => void) {
  const run = () => fn()
  stack.push(run)

  fn()

  stack.pop()

  return () => {
    return 'dispose'
  }
}