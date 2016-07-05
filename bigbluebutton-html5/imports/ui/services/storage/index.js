const SESSION = window.sessionStorage;
const LOCAL = window.localStorage;
const PREFIX = 'BBB_';

window.deps = {};

const ensureDeps = (key) => {
  if (!window.deps[key]) {
    window.deps[key] = new Tracker.Dependency;
  }
};

const get = (key, storage) => {
  key = `${PREFIX}${key}`;
  ensureDeps(key);
  window.deps[key].depend();
  return JSON.parse(storage.getItem(key));
};

const set = (key, value, storage) => {
  key = `${PREFIX}${key}`;
  ensureDeps(key);
  window.deps[key].changed();
  return storage.setItem(key, JSON.stringify(value));
};

const getSession = (key) => get(key, SESSION);
const setSession = (key, value) => set(key, value, SESSION);

const getLocal = (key) => get(key, LOCAL);
const setLocal = (key, value) => set(key, value, LOCAL);

export default {
  getSession,
  setSession,
  getLocal,
  setLocal,
};
