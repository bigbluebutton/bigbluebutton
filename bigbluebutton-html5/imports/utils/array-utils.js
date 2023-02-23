import { isObject } from 'radash';

export const range = (start, end) => {
  const length = end - start;
  return Array.from({ length }, (_, i) => start + i);
}

export const partition = (arr, criteria) => {
  return [
    arr.filter(function (item) {
      return criteria(item);
    }),
    arr.filter(function (item) {
      return !criteria(item);
    }),
  ];
};

export const indexOf = (arr, value) => {
  return arr ? arr.findIndex((item) => item === value) : -1;
}

export const without = (arr, value) => {
  return arr.filter(function (item) {
    return item !== value;
  });
}

export const defaultsDeep = (override, initial) => {
  if (!initial || !override) return initial ?? override ?? {}

  return Object.entries({ ...initial, ...override }).reduce(
    (acc, [key, value]) => {
      return {
        ...acc,
        [key]: (() => {
          if (isObject(initial[key])) {
            return { ...initial[key], ...value };
          } else {
            return value
          }
        })()
      }
    }, {}
  )
}

export default {
  range,
  partition,
  indexOf,
  without,
  defaultsDeep,
};
