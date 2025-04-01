import { isString, isEqual } from 'radash';

export type StorageData = string | object | boolean | number | null;

/**
 * Observable wrapper for browser Storage's
 */
export default class ObservableStorage {
  private readonly observers: Record<string, Set<(value: StorageData) => void>>;

  private readonly prefix: string;

  private readonly storage: Storage;

  constructor(storage: Storage, prefix = '') {
    this.observers = {};
    this.prefix = prefix;
    this.storage = storage;
  }

  public registerObserver(key: string, observer: (value: StorageData) => void) {
    const prefixedKey = this.prefixedKey(key);
    this.ensureDeps(prefixedKey);
    this.observers[prefixedKey].add(observer);
    if (typeof observer === 'function') {
      observer(this.getItem(key));
    }
  }

  public revokeObserver(key: string, observer: (value: StorageData) => void) {
    const prefixedKey = this.prefixedKey(key);
    this.ensureDeps(prefixedKey);
    this.observers[prefixedKey].delete(observer);
  }

  private ensureDeps(key: string) {
    if (!(this.observers[key] instanceof Set)) {
      this.observers[key] = new Set();
    }
  }

  private prefixedKey(key: string) {
    const unprefixedKey = key.replace(this.prefix, '');
    return `${this.prefix}${unprefixedKey}`;
  }

  public key(n: number) {
    return this.storage.key(n);
  }

  public getItem(key: string): StorageData {
    const prefixedKey = this.prefixedKey(key);
    let value = this.storage.getItem(prefixedKey);

    if (value && isString(value)) {
      try {
        value = JSON.parse(value);
      } catch (e) {
        // Do nothing, keep the value as-is
      }
    }

    return value;
  }

  public setItem(key: string, value: NonNullable<StorageData>) {
    const prefixedKey = this.prefixedKey(key);
    this.ensureDeps(prefixedKey);

    let stringifiedValue: string;
    if (isString(value)) {
      stringifiedValue = value;
    } else {
      stringifiedValue = JSON.stringify(value);
    }

    this.storage.setItem(prefixedKey, stringifiedValue);
    this.observers[prefixedKey].forEach((observer) => {
      if (typeof observer === 'function') {
        observer(value);
      }
    });
  }

  public removeItem(key: string) {
    const prefixedKey = this.prefixedKey(key);
    this.storage.removeItem(prefixedKey);
    if (!this.observers[prefixedKey]) return;
    this.observers[prefixedKey].forEach((observer) => {
      if (typeof observer === 'function') {
        observer(null);
      }
    });
  }

  public clear() {
    Object.keys(this.observers).forEach((key) => {
      this.removeItem(key);
    });
  }

  public equals(key: string, value: StorageData) {
    return isEqual(this.getItem(key), value);
  }
}
