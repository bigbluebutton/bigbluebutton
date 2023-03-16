import React from 'react';
import _ from 'lodash';
import {
  persistShape,
  removeShapes,
  notifyNotAllowedChange,
  notifyShapeNumberExceeded,
} from './service';

const WHITEBOARD_CONFIG = Meteor.settings.public.whiteboard;

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
  const invalidTypes = ['image', 'video'];
  return !invalidTypes.includes(shape?.type);
};

const sendShapeChanges = (
  app,
  changedShapes,
  shapes,
  prevShapes,
  hasShapeAccess,
  whiteboardId,
  currentUser,
  intl,
  redo = false,
) => {
  const invalidChange = Object.keys(changedShapes)
    .find((id) => !hasShapeAccess(id));

  const invalidShapeType = Object.keys(changedShapes)
    .find((id) => !isValidShapeType(changedShapes[id]));

  const currentShapes = app?.document?.pages[app?.currentPageId]?.shapes;
  const { maxNumberOfAnnotations } = WHITEBOARD_CONFIG;
  // -1 for background shape
  const shapeNumberExceeded = Object.keys(currentShapes).length - 1 > maxNumberOfAnnotations;

  const isInserting = Object.keys(changedShapes)
    .filter(
      (shape) => typeof changedShapes[shape] === 'object'
        && changedShapes[shape].type
        && !prevShapes[shape],
    ).length !== 0;

  if (invalidChange || invalidShapeType || (shapeNumberExceeded && isInserting)) {
    if (shapeNumberExceeded) {
      notifyShapeNumberExceeded(intl, maxNumberOfAnnotations);
    } else {
      notifyNotAllowedChange(intl);
    }
    const modApp = app;
    // undo last command without persisting to not generate the onUndo/onRedo callback
    if (!redo) {
      const command = app.stack[app.pointer];
      modApp.pointer -= 1;
      app.applyPatch(command.before, 'undo');
      return;
      // eslint-disable-next-line no-else-return
    } else {
      modApp.pointer += 1;
      const command = app.stack[app.pointer];
      app.applyPatch(command.after, 'redo');
      return;
    }
  }
  const deletedShapes = [];
  Object.entries(changedShapes)
    .forEach(([id, shape]) => {
      if (!shape) deletedShapes.push(id);
      else {
        // checks to find any bindings assosiated with the changed shapes.
        // If any, they may need to be updated as well.
        const pageBindings = app.page.bindings;
        if (pageBindings) {
          Object.entries(pageBindings).forEach(([, b]) => {
            if (b.toId.includes(id)) {
              const boundShape = app.getShape(b.fromId);
              if (shapes[b.fromId] && !_.isEqual(boundShape, shapes[b.fromId])) {
                const shapeBounds = app.getShapeBounds(b.fromId);
                boundShape.size = [shapeBounds.width, shapeBounds.height];
                persistShape(boundShape, whiteboardId);
              }
            }
          });
        }
        let modShape = shape;
        if (!shape.id) {
          // check it already exists (otherwise we need the full shape)
          if (!shapes[id]) {
            modShape = app.getShape(id);
          }
          modShape.id = id;
        }
        const shapeBounds = app.getShapeBounds(id);
        const size = [shapeBounds.width, shapeBounds.height];
        if (!shapes[id] || (shapes[id] && !_.isEqual(shapes[id].size, size))) {
          modShape.size = size;
        }
        if (!shapes[id] || (shapes[id] && !shapes[id].userId)) {
          modShape.userId = currentUser?.userId;
        }
        persistShape(modShape, whiteboardId);
      }
    });

  // order the ids of shapes being deleted to prevent crash
  // when removing a group shape before its children
  const orderedDeletedShapes = [];
  deletedShapes.forEach((eid) => {
    if (shapes[eid]?.type !== 'group') {
      orderedDeletedShapes.unshift(eid);
    } else {
      orderedDeletedShapes.push(eid);
    }
  });

  if (orderedDeletedShapes.length > 0) {
    removeShapes(orderedDeletedShapes, whiteboardId);
  }
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
  usePrevious, findRemoved, filterInvalidShapes, mapLanguage, sendShapeChanges,
};

export default Utils;
export {
  usePrevious, findRemoved, filterInvalidShapes, mapLanguage, sendShapeChanges,
};
