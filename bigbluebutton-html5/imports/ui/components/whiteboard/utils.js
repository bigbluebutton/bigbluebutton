import React from 'react';

const usePrevious = (value) => {
  const ref = React.useRef();
  React.useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};

const isValidShapeType = (shape) => {
  const invalidTypes = ['image', 'embed'];
  return !invalidTypes.includes(shape?.type);
};

// map different localeCodes from bbb to tldraw
const mapLanguage = (language) => {
  // bbb has xx-xx but in tldraw it's only xx
  if (['es', 'fa', 'it', 'pl', 'sv', 'uk'].some((lang) => language.startsWith(lang))) {
    return language.substring(0, 2);
  }
  // exceptions
  switch (language) {
    case 'nb-no':
      return 'no';
    case 'zh-cn':
      return 'zh-ch';
    default:
      return language;
  }
};

const getDifferences = (prev, next) => {
  // Check if the two values are the same
  if (prev === next) return undefined;

  // If both are arrays, find the differences
  if (Array.isArray(prev) && Array.isArray(next)) {
    const differences = next.filter((item, index) => prev[index] !== item);
    return differences.length > 0 ? differences : [];
  }

  // If both are objects, recursively check their properties
  if (typeof prev === 'object' && typeof next === 'object' && prev !== null && next !== null) {
    const differences = {};

    Object.keys(next).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(next, key)) {
        const diff = getDifferences(prev[key], next[key]);
        if (diff !== undefined) {
          differences[key] = diff;
        }
      }
    });
    return Object.keys(differences).length > 0 ? differences : undefined;
  }

  // For other types, return the next value if different
  return next;
};

const Utils = {
  usePrevious, mapLanguage, isValidShapeType, getDifferences,
};

export default Utils;
export {
  usePrevious, mapLanguage, isValidShapeType, getDifferences,
};
