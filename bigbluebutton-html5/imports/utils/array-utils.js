import { isObject } from 'radash';

export const range = (start, end) => {
  const length = end - start;
  return Array.from({ length }, (_, i) => start + i);
};

export const partition = (arr, criteria) => [
  arr.filter((item) => criteria(item)),
  arr.filter((item) => !criteria(item)),
];

export const indexOf = (arr, value) => (arr ? arr.findIndex((item) => item === value) : -1);

export const without = (arr, value) => arr.filter((item) => item !== value);

export const defaultsDeep = (override, initial) => {
  if (!initial || !override) return initial ?? override ?? {};

  return Object.entries({ ...initial, ...override }).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: (() => {
        if (isObject(initial[key])) {
          return defaultsDeep(value, initial[key]);
        }
        return value;
      })(),
    }), {},
  );
};

export default {
  range,
  partition,
  indexOf,
  without,
  defaultsDeep,
};
