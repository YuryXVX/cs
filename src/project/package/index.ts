import { computed } from "./core/computed.ts"
import { effect } from "./core/effect.ts"
import { ref } from "./core/Signal.ts"

const a = ref(1)
const b = computed(() => a.get() * 2)
const c = computed(() => a.get() + 1)
const d = computed(() => b.get() + c.get())

effect(() => console.log(d.get())) // 4
a.set(2) // должно быть 7, эффект вызывается 1 раз