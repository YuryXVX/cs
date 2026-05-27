
class Hasher<Key extends object | string | number> {
  #ids = new WeakMap()
  #id = 0

  #transform(key: Key) {
    if(typeof key !== 'object' || key == null) {
      return `${typeof key}:${String(key)}`
    }

    if(!this.#ids.has(key)) {
      this.#id++

      this.#ids.set(key, this.#id)
    }

    return `object:${this.#ids.get(key)}`
  }

  hash(key: Key, tableSize: number) {
    const stringKey = this.#transform(key)

    let hash = 5381;
    for (let i = 0; i < stringKey.length; i++) {
      hash = (hash << 5) + hash + stringKey.charCodeAt(i);
    }

    const unsignedHash = hash >>> 0;
    
    return unsignedHash % tableSize;
  }
}


class HashMap<Key extends object | string | number, Value = any> {
  #size: number
  #buffer: unknown[]
  #hasher = new Hasher()

  constructor(initSize: number) {
    this.#buffer = Array(initSize).fill(null)
  }

  set(k: Key, v: Value) {
    const key = this.#hasher.hash(k, this.#buffer.length)

    this.#buffer.push([key, [v]])
  }

  get(k: Key) {
    console.log(this.#buffer.reverse())
  }
}



const map = new HashMap(120);

map.set("foo", 1)
map.set("foo", 10)

console.log(map.get("foo"))

// map.set("foo", 1);
// map.set(42, 10);
// map.set(document, 100);

// console.log(map.get(42));          // 10
// console.log(map.has(document));    // true
// console.log(map.delete(document)); // 10
// console.log(map.has(document));    // false