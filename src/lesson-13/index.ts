import { Hasher } from "./hasher.ts";
import { ChainNode } from "./node.ts";

import type { HashMapConfig, IHashMap, IHasher } from "./types.ts";

// метод цепочек
class HashMap<Key extends string | number | object | null, Value> implements IHashMap<Key, Value> {
  #capacity: number
  #size: number
  #hasher: IHasher
  #loadFactor: number

  #buckets: (ChainNode<Key, Value> | null)[]

  private static loadFactor = 0.75 
  private static defaultCapacity = 100

  constructor({ 
    capacity,
    hasher,
    loadFactor 
  }: HashMapConfig) {
    this.#size = 0
    this.#capacity = capacity ?? HashMap.defaultCapacity
    this.#hasher = hasher ?? new Hasher()

    this.#loadFactor = loadFactor ?? HashMap.loadFactor

    this.#buckets = Array(this.#capacity).fill(null)
  }

  get(key: Key): Value | undefined {
    const index = this.#hasher.hash(key, this.#capacity)
    const foundNode = this.#findNode(this.#buckets[index] ?? null, key)

    return foundNode?.value
  }
  
  set(key: Key, value: Value) {
    const currentLoadFactor = this.#size / this.#capacity

    if(currentLoadFactor >= this.#loadFactor) {
      this.#resize()
    }
    

    const index = this.#hasher.hash(key, this.#capacity)
    const head = this.#buckets[index] ?? null

    const foundNode = this.#findNode(head, key)

    if(foundNode) {
      foundNode.value = value
      return this
    } 

    const newNode = new ChainNode(key, value)

    newNode.next = head

    this.#buckets[index] = newNode
    
    this.#size = this.#size + 1

    return this
  }

  remove(key: Key): Value | undefined {
    const index = this.#hasher.hash(key, this.#capacity)
    const head = this.#buckets[index]

    if(head == null) {
      return undefined
    }
  
    if(this.#hasher.equal(head.key, key)) {
      this.#buckets[index] = head.next
      this.#size--
      
      return head?.value
    }


    let current: ChainNode<Key, Value> | null = head;
    
    while(current !== null) {
      if(this.#hasher.equal(current.key, key)) {
        const deleted = current;

        current.next = deleted

        this.#size--
      
        return deleted.value
      }

      current = current.next;
    }
  

    return undefined
  }


  clear(): void {
    this.#size = 0
    this.#buckets = Array(this.#capacity).fill(null)
  }

  isEmpty(): boolean {
    return this.#size === 0
  }

  size(): number {
    return this.#size
  }

  #findNode(head: ChainNode<Key, Value> | null, key: Key) {
    let current = head
    
    while(current !== null) {
      if(this.#hasher.equal(current.key, key)) {
        return current
      }

      current = current.next 
    }
  }

  #resize() {
    const oldBuckets = this.#buckets

    this.#capacity = oldBuckets.length * 2

    this.#buckets = Array(this.#capacity).fill(null)
    this.#size = 0

    for(const bucket of oldBuckets) {
      let head = bucket

      while(head != null) {
        this.set(head.key, head.value) 
        head = head.next
      }
    }
  }


  [Symbol.iterator]() {
    return this.entries()
  }

  // iterable
  *entries() {
    for(const bucket of this.#buckets) {
      let node = bucket;

      while(node !== null) {
        yield [node.key, node.value]
        node = node.next
      }
    }
  }

  *keys() {
    for(const bucket of this.#buckets) {
      let node = bucket;

      while(node != null) {
        yield node.key
        node = node.next
      }
    }
  }

  *values() {
    for(const bucket of this.#buckets) {
      let node = bucket;

      while(node != null) {
        yield node.value

        node = node.next
      }
    }
  }
}

const map = new HashMap<string, string>({
  capacity: 10,
})

for(let i = 0; i <= 500; i++) {
  map.set(i.toString(), i.toString())
}
