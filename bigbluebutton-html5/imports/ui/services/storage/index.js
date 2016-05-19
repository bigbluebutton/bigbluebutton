const STORAGE = localStorage;
const PREFIX = 'bbb_';

function get(key) {
  return STORAGE.getItem(key);
}

function set(key) {
  STORAGE.setItem(key);
}

export default {
  get,
  set
}
