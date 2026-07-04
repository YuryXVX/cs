export interface StreamLike<T> {
  subscribe(next: (value: T) => void): { unsubscribe(): void }
}