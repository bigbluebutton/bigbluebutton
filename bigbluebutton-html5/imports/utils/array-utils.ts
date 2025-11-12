import { isObject } from 'radash';

export const range = (start: number, end: number) => {
  const length = end - start;
  return Array.from({ length }, (_, i) => start + i);
};

export const partition = <A, F extends (a: A) => boolean>(arr: A[], criteria: F) => [
  arr.filter((item) => criteria(item)),
  arr.filter((item) => !criteria(item)),
];

export const indexOf = <A>(arr?: A[], value?: A) => (arr && value !== undefined ? arr.indexOf(value) : -1);

export const without = <A>(arr: A[], value: A) => arr.filter((item) => item !== value);

export const defaultsDeep = (
  override: Record<string | number | symbol, unknown>,
  initial: Record<string | number | symbol, unknown>,
) => {
  if (!initial || !override) return initial ?? override ?? {};

  return Object.entries({ ...initial, ...override }).reduce(
    (acc, [key, value]): Record<string | number | symbol, unknown> => ({
      ...acc,
      [key]: (() => {
        if (isObject(initial[key])) {
          return defaultsDeep(
            value as Record<string | number | symbol, unknown>,
            initial[key] as Record<string | number | symbol, unknown>,
          );
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
