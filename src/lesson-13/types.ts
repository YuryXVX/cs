export interface IHashMap<K, V> {
  set(key: K, value: V): IHashMap<K, V>;
  get(key: K): V | undefined;
  remove(key: K): V | undefined;

  size(): number;

  isEmpty(): boolean;

  clear(): void;
}

export interface IHasher<Key = unknown> {
  hash(key: Key, cap: number): number
  equal(a: Key, b: Key): boolean
}


export interface HashMapConfig {
  capacity?: number
  hasher?: IHasher
  loadFactor?: number
}