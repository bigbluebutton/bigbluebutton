import ObservableStorage from './observable';

class InMemoryStorage implements Storage {
  private readonly store: Map<string, string>;

  constructor() {
    this.store = new Map<string, string>();
  }

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys()).at(index) ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

const singleton = new ObservableStorage(new InMemoryStorage());

export default singleton;
