import { Match } from 'meteor/check';

export default function deepMerge(merge, ...sources) {
  if (!sources.length) return merge;

  const source = sources.shift();

  let merged = merge;

  if (Match.test(merged, Array)) {
    if (Match.test(source, Array)) {
      merged.push(...source);
    } else {
      merged.push(source);
    }
  } else if (Match.test(merged, Object)) {
    if (Match.test(source, Object)) {
      Object.keys(source).forEach((key) => {
        if (!merged[key]) {
          merged[key] = source[key];
        } else {
          deepMerge(merged[key], source[key]);
        }
      });
    }
  } else {
    merged = source;
  }

  return deepMerge(merged, ...sources);
}
