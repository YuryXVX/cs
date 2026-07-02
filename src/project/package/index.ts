import { computed, ref, effect } from './core/index.ts'

const firstName = ref('yury')
const lastName = ref('bagdasaryan')

effect(() => {
  lastName.set('Ivanov')
  firstName.set('Ivan')
})

const isAdmin = computed(() => {
  return lastName.get() === 'Ivanov' 
})

const fullName = computed(
  () => {
    const name = firstName.get()
    const surname = lastName.get()

    return `${name}_${surname}`
  }
)


firstName.set('Anton')

console.log(fullName.get(), isAdmin.get())
