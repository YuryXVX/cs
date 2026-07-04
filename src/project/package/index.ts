import { computed, effect, from, ref } from "./reactive/index.ts"


const a = ref(1)
const b = computed(() => a.get() * 2)
const c = computed(() => a.get() + 1)
const d = computed(() => b.get() + c.get())

effect(() => {
  console.log(d.get())
})

// Первый запуск: 4
// a.set(2): должно быть 7, эффект вызывается 1 раз
a.set(2)


const stream = {
  subscribe(next: (v: number) => void) {
    let i = 0

    const id = setInterval(() => next(i++), 1000)
    return { unsubscribe: () => clearInterval(id) }
  }
}

const s = from(stream, 10)

effect(() => console.log(s.get()))
