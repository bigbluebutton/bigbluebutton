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

const Utils = {
  usePrevious, mapLanguage, isValidShapeType,
};

export default Utils;
export {
  usePrevious, mapLanguage, isValidShapeType,
};
