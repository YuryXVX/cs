import { Signal, Computed, effect } from './core/index.ts'

const firstName = new Signal('yury')
const lastName = new Signal('bagdasaryan')

effect(() => {
  lastName.set('Ivanov')
  firstName.set('Ivan')
})

const fullName = new Computed(
  () => {
    const name = firstName.get()
    const surname = lastName.get()

    return `${name}_${surname}`
  }
)


firstName.set('Anton')



console.log(fullName.get())
