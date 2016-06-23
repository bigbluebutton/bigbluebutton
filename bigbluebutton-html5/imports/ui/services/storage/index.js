const STORAGE = sessionStorage;
const PREFIX = 'BBB_';

const get = (key) => STORAGE.getItem(`${PREFIX}${key}`);

const set = (key, value) => STORAGE.setItem(`${PREFIX}${key}`, value);

export default {
  get,
  set,
};
