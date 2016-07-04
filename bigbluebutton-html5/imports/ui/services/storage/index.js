const SESSION = window.sessionStorage;
const LOCAL = window.localStorage;
const PREFIX = 'BBB_';

const get = (key, storage) => JSON.parse(storage.getItem(`${PREFIX}${key}`));
const set = (key, value, storage) => storage.setItem(`${PREFIX}${key}`, JSON.stringify(value));

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
