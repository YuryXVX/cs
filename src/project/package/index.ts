import { filter, map } from "./reactive/operators.ts"
import { ref } from "./reactive/signal.ts"

const a = ref(1)
const doubled = map(a, v => v * 2)

const onlyBig = filter(doubled, v => {
  return v ? v > 5 : false
})

onlyBig.subscribe(v => console.log('big:', v))

a.set(2)  // doubled=4 → тишина
a.set(3)  // doubled=6 → "big: 6"
a.set(4)  // doubled=8 → "big: 8"
a.set(10)

onlyBig.get()
