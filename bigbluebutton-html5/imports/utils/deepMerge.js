import { Match } from 'meteor/check';

export default function deepMerge(origin, ...sources) {
  if (!sources.length) return origin;

  const source = sources.shift();

  if (Match.test(origin, Array)) {
    if (Match.test(source, Array)) {
      origin.push(...source);

    } else {
      origin.push(source);

    }
  } else if (Match.test(origin, Object)) {
    if (Match.test(source, Object)) {
      Object.keys(source).forEach((key) => {
        if (!origin[key]) {
          origin[key] = source[key];

        } else {
          deepMerge(origin[key], source[key]);

        }
      });
    }
  } else {
    origin = source;

  }

  return deepMerge(origin, ...sources);
};
