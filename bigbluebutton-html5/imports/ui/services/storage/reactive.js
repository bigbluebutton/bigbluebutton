import _ from 'underscore';
import { Tracker } from 'meteor/tracker';
import { EJSON } from 'meteor/ejson';

// Reactive wrapper for browser Storage's

export default class StorageTracker {
  constructor(storage, prefix = '') {
    if (!storage instanceof Storage) {
      throw `Expecting a instanceof Storage recieve a '${storage.constructor.name}' instance`;
    }

    this._trackers = {};
    this._prefix = prefix;
    this._storage = storage;
  }

  _ensureDeps(key) {
    if (!this._trackers[key]) {
      this._trackers[key] = new Tracker.Dependency;
    }
  }

  _prefixedKey(key) {
    return `${this._prefix}${key}`;
  }

  key(n) {
    return this._storage.key(n);
  }

  getItem(key) {
    key = this._prefixedKey(key);
    this._ensureDeps(key);

    this._trackers[key].depend();
    let value = this._storage.getItem(key);

    if (value && _.isString(value)) {
      try {
        value = EJSON.parse(value);
      } catch (e) {}
    }

    return value;
  }

  setItem(key, value) {
    key = this._prefixedKey(key);
    this._ensureDeps(key);

    if (_.isObject(value)) {
      value = EJSON.stringify(value);
    }

    this._storage.setItem(key, value);
    this._trackers[key].changed();
  }

  removeItem(key) {
    key = this._prefixedKey(key);
    this._storage.removeItem(key);
    this._trackers[key].changed();
    delete this._trackers[key];
  }

  clear() {
    Object.keys(this._trackers).forEach(key => {
      this.removeItem(key);
    });
  }
};
