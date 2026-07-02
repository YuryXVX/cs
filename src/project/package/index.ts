import { effect } from './core/effect.ts'
import { Signal } from './core/index.ts'

const signal = new Signal({
  a: '1'
})

effect(() => {
  console.log('here', signal.get())
})

signal.set({
  a: '10',
})


