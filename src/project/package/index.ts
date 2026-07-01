import { Signal } from './core/index.ts'

const signal = new Signal(1)


signal.subscribe((newValue) => {
  console.log({newValue})
})

signal.set(2)