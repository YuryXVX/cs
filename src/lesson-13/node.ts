export class ChainNode<K, V> {
  constructor(
    public key: K,
    public value: V,
    // сыылка на следуюшую ноды коллизии
    public next: ChainNode<K, V> | null = null,
  ) {}
}
