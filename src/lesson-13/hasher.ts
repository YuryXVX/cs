import type { IHasher } from "./types.ts";

interface Hashable {
  hashCode(): string | number;
}

function isObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null;
}

function hasHashMethod(value: unknown): value is Hashable {
  return isObject(value) && 'hashCode' in value && typeof value.hashCode === 'function';
}

export abstract class AbstractHasher implements IHasher {
  abstract hash(_key: object | string | number | null, _capacity: number): number;
  abstract equal(a: unknown, b: unknown): boolean;
}

export class Hasher<Key extends object | string | number | null> extends AbstractHasher {
  readonly #ids = new WeakMap<object, number>();
  #nextId = 1;

  override equal(a: Key, b: Key): boolean {
    return this.#transform(a) === this.#transform(b)
  }

  override hash(key: Key, capacity: number): number {
    if (capacity <= 0) throw new Error('capacity must be > 0')

    let hash = 0
    const str = this.#transform(key)

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash >>> 0
    }

    return hash % capacity;
  }


  #transform(key: Key): string {
    if (key === null) return 'null';

    if (isObject(key)) {
      if (hasHashMethod(key)) {
        return `object-method:${key.hashCode()}`;
      }

      if (!this.#ids.has(key)) {
        this.#ids.set(key, this.#nextId++);
      }
      return `object-id:${this.#ids.get(key)}`;
    }

    return `${typeof key}:${String(key)}`;
  }
}