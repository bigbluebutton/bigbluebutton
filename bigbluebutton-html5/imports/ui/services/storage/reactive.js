import { Tracker } from 'meteor/tracker';
import { EJSON } from 'meteor/ejson';
import { isObject, isArray, isString } from 'radash';

// Reactive wrapper for browser Storage's

export default class StorageTracker {
  constructor(storage, prefix = '') {
    if (!(storage instanceof Storage)) {
      throw `Expecting a instanceof Storage recieve a '${storage.constructor.name}' instance`;
    }

    this._trackers = {};
    this._prefix = prefix;
    this._storage = storage;
  }

  _ensureDeps(key) {
    if (!this._trackers[key]) {
      this._trackers[key] = new Tracker.Dependency();
    }
  }

  _prefixedKey(key) {
    key = key.replace(this._prefix, '');
    return `${this._prefix}${key}`;
  }

  key(n) {
    return this._storage.key(n);
  }

  getItem(key) {
    const prefixedKey = this._prefixedKey(key);
    this._ensureDeps(prefixedKey);
    this._trackers[prefixedKey].depend();

    let value = this._storage.getItem(prefixedKey);

    if (value && isString(value)) {
      try {
        value = EJSON.parse(value);
      } catch (e) {}
    }

    return value;
  }

  setItem(key, value) {
    const prefixedKey = this._prefixedKey(key);
    this._ensureDeps(prefixedKey);

    if (isObject(value) || isArray(value)) {
      value = EJSON.stringify(value);
    }

    this._storage.setItem(prefixedKey, value);
    this._trackers[prefixedKey].changed();
  }

  removeItem(key) {
    const prefixedKey = this._prefixedKey(key);
    this._storage.removeItem(prefixedKey);
    if (!this._trackers[prefixedKey]) return;
    this._trackers[prefixedKey].changed();
    delete this._trackers[prefixedKey];
  }

  clear() {
    Object.keys(this._trackers).forEach((key) => {
      this.removeItem(key);
    });
  }
}
