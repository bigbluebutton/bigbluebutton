import React from 'react';

const WHITEBOARD_CONFIG = window.meetingClientSettings.public.whiteboard;
const ROLE_MODERATOR = window.meetingClientSettings.public.user.role_moderator;

const usePrevious = (value) => {
  const ref = React.useRef();
  React.useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};

const findRemoved = (A, B) => A.filter((a) => !B.includes(a));

const filterInvalidShapes = (shapes, curPageId, tldrawAPI) => {
  const retShapes = shapes;
  const keys = Object.keys(shapes);
  const removedChildren = [];
  const removedParents = [];

  keys.forEach((shape) => {
    if (shapes[shape].parentId !== curPageId) {
      if (!keys.includes(shapes[shape].parentId)) {
        delete retShapes[shape];
      }
    } else if (shapes[shape].type === 'group') {
      const groupChildren = shapes[shape].children;

      groupChildren.forEach((child) => {
        if (!keys.includes(child)) {
          removedChildren.push(child);
        }
      });
      retShapes[shape].children = groupChildren.filter((child) => !removedChildren.includes(child));

      if (shapes[shape].children.length < 2) {
        removedParents.push(shape);
        delete retShapes[shape];
      }
    }
  });
  // remove orphaned children
  Object.keys(shapes).forEach((shape) => {
    if (shapes[shape] && shapes[shape].parentId !== curPageId) {
      if (removedParents.includes(shapes[shape].parentId)) {
        delete retShapes[shape];
      }
    }

    // remove orphaned bindings
    if (shapes[shape] && shapes[shape].type === 'arrow'
      && (shapes[shape].handles.start.bindingId || shapes[shape].handles.end.bindingId)) {
      const startBinding = shapes[shape].handles.start.bindingId;
      const endBinding = shapes[shape].handles.end.bindingId;

      const startBindingData = tldrawAPI?.getBinding(startBinding);
      const endBindingData = tldrawAPI?.getBinding(endBinding);

      if (startBinding && (!startBindingData && (
        removedParents.includes(startBindingData?.fromId)
        || removedParents.includes(startBindingData?.toId)
        || !keys.includes(startBindingData?.fromId)
        || !keys.includes(startBindingData?.toId)
      ))) {
        delete retShapes[shape].handles.start.bindingId;
      }
      if (endBinding && (!endBindingData && (
        removedParents.includes(endBindingData?.fromId)
        || removedParents.includes(endBindingData?.toId)
        || !keys.includes(endBindingData?.fromId)
        || !keys.includes(endBindingData?.toId)
      ))) {
        delete retShapes[shape].handles.end.bindingId;
      }
    }
  });
  return retShapes;
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
  usePrevious, findRemoved, filterInvalidShapes, mapLanguage,
};

export default Utils;
export {
  usePrevious, findRemoved, filterInvalidShapes, mapLanguage, isValidShapeType,
};
