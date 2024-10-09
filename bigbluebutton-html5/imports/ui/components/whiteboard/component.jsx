import * as React from 'react';
import PropTypes from 'prop-types';
import { useRef, useCallback } from 'react';
import { debounce, isEqual } from 'radash';
import {
  Tldraw,
  DefaultColorStyle,
  DefaultDashStyle,
  DefaultFillStyle,
  DefaultFontStyle,
  DefaultSizeStyle,
  InstancePresenceRecordType,
  setDefaultUiAssetUrls,
  setDefaultEditorAssetUrls,
} from '@bigbluebutton/tldraw';
import '@bigbluebutton/tldraw/tldraw.css';
// eslint-disable-next-line import/no-extraneous-dependencies
import { compressToBase64, decompressFromBase64 } from 'lz-string';
import SlideCalcUtil, { HUNDRED_PERCENT } from '/imports/utils/slideCalcUtils';
import meetingClientSettingsInitialValues from '/imports/ui/core/initial-values/meetingClientSettings';
import getFromUserSettings from '/imports/ui/services/users-settings';
import KEY_CODES from '/imports/utils/keyCodes';
import Styled from './styles';
import {
  mapLanguage,
  isValidShapeType,
  usePrevious,
  getDifferences,
} from './utils';
import { useMouseEvents, useCursor } from './hooks';
import { notifyShapeNumberExceeded, getCustomEditorAssetUrls, getCustomAssetUrls } from './service';

import NoopTool from './custom-tools/noop-tool/component';

const CAMERA_TYPE = 'camera';

// Helper functions
const deleteLocalStorageItemsWithPrefix = (prefix) => {
  const keysToRemove = Object.keys(localStorage).filter((key) => key.startsWith(prefix));
  keysToRemove.forEach((key) => localStorage.removeItem(key));
};

// Example of typical LocalStorage entry tldraw creates:
// `{ TLDRAW_USER_DATA_v3: '{"version":2,"user":{"id":"epDk1 ...`
const clearTldrawCache = () => {
  deleteLocalStorageItemsWithPrefix('TLDRAW');
};

const calculateEffectiveZoom = (
  initViewboxWidth, curViewboxWidth, initViewboxHeight, curViewboxHeight,
) => {
  // Calculate the effective zoom level based on the change in viewBox dimensions
  const widthZoomValue = (initViewboxWidth * 100) / curViewboxWidth;
  const heightZoomValue = (initViewboxHeight * 100) / curViewboxHeight;

  // Take the smaller zoom value to ensure the entire content fits in the viewbox
  const effectiveZoomValue = Math.min(widthZoomValue, heightZoomValue);
  return effectiveZoomValue;
};

const createCamera = (pageId, zoomLevel) => ({
  id: `camera:page:${pageId}`,
  meta: {},
  typeName: CAMERA_TYPE,
  x: 0,
  y: 0,
  z: zoomLevel,
});

const defaultUser = {
  userId: '',
};

const Whiteboard = React.memo((props) => {
  const {
    isPresenter = false,
    removeShapes,
    persistShapeWrapper,
    shapes,
    assets,
    currentUser = defaultUser,
    whiteboardId = undefined,
    zoomSlide,
    curPageNum: curPageId,
    zoomChanger,
    isMultiUserActive,
    isRTL,
    fitToWidth,
    zoomValue,
    colorStyle,
    dashStyle,
    fillStyle,
    fontStyle,
    sizeStyle,
    presentationAreaHeight,
    presentationAreaWidth,
    setTldrawIsMounting,
    setTldrawAPI,
    whiteboardToolbarAutoHide,
    toggleToolsAnimations,
    animations,
    isToolbarVisible,
    isModerator,
    currentPresentationPage,
    presentationId = undefined,
    hasWBAccess,
    bgShape,
    publishCursorUpdate,
    otherCursors,
    hideViewersCursor,
    presentationHeight,
    skipToSlide,
    intl,
    maxNumberOfAnnotations,
    notifyNotAllowedChange,
    locale,
    darkTheme,
    selectedLayout,
    isInfiniteWhiteboard,
    whiteboardWriters,
  } = props;

  clearTldrawCache();

  const [tlEditor, setTlEditor] = React.useState(null);
  const [isMounting, setIsMounting] = React.useState(true);

  if (isMounting) {
    setDefaultEditorAssetUrls(getCustomEditorAssetUrls());
    setDefaultUiAssetUrls(getCustomAssetUrls());
  }

  const whiteboardRef = React.useRef(null);
  const zoomValueRef = React.useRef(null);
  const prevShapesRef = React.useRef(shapes);
  const tlEditorRef = React.useRef(tlEditor);
  const slideChanged = React.useRef(false);
  const slideNext = React.useRef(null);
  const prevZoomValueRef = React.useRef(null);
  const initialZoomRef = useRef(null);
  const isMouseDownRef = useRef(false);
  const shapeBatchRef = useRef({});
  const isMountedRef = useRef(false);
  const isWheelZoomRef = useRef(false);
  const isPresenterRef = useRef(isPresenter);
  const whiteboardIdRef = React.useRef(whiteboardId);
  const curPageIdRef = React.useRef(curPageId);
  const hasWBAccessRef = React.useRef(hasWBAccess);
  const isModeratorRef = React.useRef(isModerator);
  const currentPresentationPageRef = React.useRef(currentPresentationPage);
  const initialViewBoxWidthRef = React.useRef(null);
  const initialViewBoxHeightRef = React.useRef(null);
  const previousTool = React.useRef(null);
  const bgSelectedRef = React.useRef(false);

  const THRESHOLD = 0.1;
  const CAMERA_UPDATE_DELAY = 650;
  const lastKnownHeight = React.useRef(presentationAreaHeight);
  const lastKnownWidth = React.useRef(presentationAreaWidth);

  // eslint-disable-next-line no-unused-vars
  const [shapesVersion, setShapesVersion] = React.useState(0);
  const customTools = [NoopTool];

  const presenterChanged = usePrevious(isPresenter) !== isPresenter;

  let clipboardContent = null;
  let isPasting = false;
  let pasteTimeout = null;

  const setIsMouseDown = (val) => {
    isMouseDownRef.current = val;
  };

  const setIsWheelZoom = (val) => {
    isWheelZoomRef.current = val;
  };

  const setWheelZoomTimeout = () => {
    isWheelZoomRef.currentTimeout = setTimeout(() => {
      setIsWheelZoom(false);
    }, 300);
  };

  React.useEffect(() => {
    currentPresentationPageRef.current = currentPresentationPage;
  }, [currentPresentationPage]);

  React.useEffect(() => {
    curPageIdRef.current = curPageId;
  }, [curPageId]);

  React.useEffect(() => {
    isModeratorRef.current = isModerator;
  }, [isModerator]);

  React.useEffect(() => {
    whiteboardIdRef.current = whiteboardId;
  }, [whiteboardId]);

  React.useEffect(() => {
    hasWBAccessRef.current = hasWBAccess;

    if (!hasWBAccess && !isPresenter) {
      tlEditorRef?.current?.setCurrentTool('noop');
    } else if (hasWBAccess && !isPresenter) {
      tlEditorRef?.current?.setCurrentTool('draw');
    }
  }, [hasWBAccess]);

  React.useEffect(() => {
    isPresenterRef.current = isPresenter;

    if (!hasWBAccessRef.current && !isPresenter) {
      tlEditorRef?.current?.setCurrentTool('noop');
    }
  }, [isPresenter]);

  React.useEffect(() => {
    if (!isEqual(prevShapesRef.current, shapes)) {
      prevShapesRef.current = shapes;
      setShapesVersion((v) => v + 1);
    }
  }, [shapes]);

  const handleCopy = useCallback(() => {
    const selectedShapes = tlEditorRef.current?.getSelectedShapes();
    if (!selectedShapes || selectedShapes.length === 0) {
      return;
    }
    const content = tlEditorRef.current?.getContentFromCurrentPage(
      selectedShapes.map((shape) => shape.id),
    );
    if (content) {
      clipboardContent = content;
      const stringifiedClipboard = compressToBase64(
        JSON.stringify({
          type: 'application/tldraw',
          kind: 'content',
          data: content,
        }),
      );

      if (navigator.clipboard?.write) {
        const htmlBlob = new Blob([`<tldraw>${stringifiedClipboard}</tldraw>`], {
          type: 'text/html',
        });

        navigator.clipboard.write([
          new ClipboardItem({
            'text/html': htmlBlob,
            'text/plain': new Blob([''], { type: 'text/plain' }),
          }),
        ]);
      } else if (navigator.clipboard.writeText) {
        navigator.clipboard.writeText(`<tldraw>${stringifiedClipboard}</tldraw>`);
      }
    }
  }, [tlEditorRef]);

  const handleCut = useCallback((shouldCopy) => {
    const selectedShapes = tlEditorRef.current?.getSelectedShapes();
    if (!selectedShapes || selectedShapes.length === 0) {
      return;
    }
    if (shouldCopy) {
      handleCopy();
    }
    tlEditorRef.current?.deleteShapes(selectedShapes.map((shape) => shape.id));
  }, [tlEditorRef]);

  const pasteTldrawContent = (editor, clipboard, point) => {
    const p = point ?? (editor.inputs.shiftKey ? editor.inputs.currentPagePoint : undefined);
    editor.mark('paste');
    editor.putContentOntoCurrentPage(clipboard, {
      point: p,
      select: true,
    });
  };

  const handlePaste = useCallback(() => {
    if (isPasting) {
      return;
    }
    isPasting = true;

    clearTimeout(pasteTimeout);
    pasteTimeout = setTimeout(() => {
      if (clipboardContent) {
        pasteTldrawContent(tlEditorRef.current, clipboardContent);
        isPasting = false;
      } else {
        navigator.clipboard.readText().then((text) => {
          const match = text.match(/<tldraw>(.*)<\/tldraw>/);
          if (match && match[1]) {
            const content = JSON.parse(decompressFromBase64(match[1]));
            pasteTldrawContent(tlEditorRef.current, content);
          }
          isPasting = false;
        }).catch(() => {
          isPasting = false;
        });
      }
    }, 100);
  }, [tlEditorRef]);

  const handleKeyDown = useCallback((event) => {
    if (event.repeat) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    const key = event.key.toLowerCase();

    if (key === 'escape' || event.keyCode === 27) {
      tlEditorRef.current?.deselect(...tlEditorRef.current?.getSelectedShapes());
      return;
    }

    const editingShape = tlEditorRef.current?.getEditingShape();
    if (editingShape && (isPresenterRef.current || hasWBAccessRef.current)) {
      return;
    }

    if (key === 'delete') {
      handleCut(false);
      return;
    }

    if (key === ' ' && tlEditorRef.current?.getCurrentToolId() !== 'hand' && isPresenterRef.current) {
      previousTool.current = tlEditorRef.current?.getCurrentToolId();
      tlEditorRef.current?.setCurrentTool('hand');
      return;
    }

    // Mapping of simple key shortcuts to tldraw functions
    const simpleKeyMap = {
      v: () => tlEditorRef.current?.setCurrentTool('select'),
      d: () => tlEditorRef.current?.setCurrentTool('draw'),
      e: () => tlEditorRef.current?.setCurrentTool('eraser'),
      h: () => {
        if (isPresenterRef.current) {
          tlEditorRef.current?.setCurrentTool('hand');
        }
      },
      r: () => tlEditorRef.current?.setCurrentTool('rectangle'),
      o: () => tlEditorRef.current?.setCurrentTool('ellipse'),
      a: () => tlEditorRef.current?.setCurrentTool('arrow'),
      l: () => tlEditorRef.current?.setCurrentTool('line'),
      t: () => tlEditorRef.current?.setCurrentTool('text'),
      f: () => tlEditorRef.current?.setCurrentTool('frame'),
      n: () => tlEditorRef.current?.setCurrentTool('note'),
    };

    if (event.ctrlKey || event.metaKey) {
      if (key === 'z') {
        event.preventDefault();
        event.stopPropagation();
        if (event.shiftKey) {
          // Redo (Ctrl + Shift + z)
          tlEditorRef.current?.redo();
        } else {
          // Undo (Ctrl + z)
          tlEditorRef.current?.undo();
        }
        return;
      }

      const ctrlKeyMap = {
        a: () => {
          tlEditorRef.current?.selectAll();
          tlEditorRef.current?.setCurrentTool('select');
        },
        d: () => {
          tlEditorRef.current
            ?.duplicateShapes(tlEditorRef.current?.getSelectedShapes(), { x: 35, y: 35 });
          tlEditorRef.current?.selectNone();
        },
        x: () => {
          handleCut(true);
        },
        c: () => {
          handleCopy();
        },
        v: () => {
          if (!isPasting) {
            handlePaste();
          }
        },
      };

      if (ctrlKeyMap[key]) {
        event.preventDefault();
        event.stopPropagation();
        ctrlKeyMap[key]();
        return;
      }
    }

    if (!event.altKey && !event.ctrlKey && !event.shiftKey && simpleKeyMap[key]) {
      event.preventDefault();
      event.stopPropagation();
      simpleKeyMap[key]();
      return;
    }

    const moveDistance = 10;
    const selectedShapes = tlEditorRef.current?.getSelectedShapes().map((shape) => shape.id);

    const arrowKeyMap = {
      ArrowUp: { x: 0, y: -moveDistance },
      ArrowDown: { x: 0, y: moveDistance },
      ArrowLeft: { x: -moveDistance, y: 0 },
      ArrowRight: { x: moveDistance, y: 0 },
    };

    if (arrowKeyMap[event.key]) {
      event.preventDefault();
      event.stopPropagation();
      tlEditorRef.current?.nudgeShapes(selectedShapes, arrowKeyMap[event.key], { squashing: true });
    }
  }, [
    tlEditorRef, isPresenterRef, hasWBAccessRef, previousTool, handleCut, handleCopy, handlePaste,
  ]);

  React.useEffect(() => {
    if (whiteboardRef.current) {
      whiteboardRef.current.addEventListener('keydown', handleKeyDown, {
        capture: true,
      });
    }

    return () => {
      whiteboardRef.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, [whiteboardRef.current]);

  const language = React.useMemo(() => mapLanguage(locale?.toLowerCase() || 'en'), [locale]);

  const [cursorPosition, updateCursorPosition] = useCursor(
    publishCursorUpdate,
    whiteboardIdRef.current,
  );

  const handleTldrawMount = (editor) => {
    setTlEditor(editor);
    setTldrawAPI(editor);

    editor?.user?.updateUserPreferences({ locale: language });

    const colorStyles = [
      'black',
      'blue',
      'green',
      'grey',
      'light-blue',
      'light-green',
      'light-red',
      'light-violet',
      'orange',
      'red',
      'violet',
      'yellow',
    ];
    const dashStyles = ['dashed', 'dotted', 'draw', 'solid'];
    const fillStyles = ['none', 'pattern', 'semi', 'solid'];
    const fontStyles = ['draw', 'mono', 'sans', 'serif'];
    const sizeStyles = ['l', 'm', 's', 'xl'];

    if (colorStyles.includes(colorStyle)) {
      editor.setStyleForNextShapes(DefaultColorStyle, colorStyle);
    }
    if (dashStyles.includes(dashStyle)) {
      editor.setStyleForNextShapes(DefaultDashStyle, dashStyle);
    }
    if (fillStyles.includes(fillStyle)) {
      editor.setStyleForNextShapes(DefaultFillStyle, fillStyle);
    }
    if (fontStyles.includes(fontStyle)) {
      editor.setStyleForNextShapes(DefaultFontStyle, fontStyle);
    }
    if (sizeStyles.includes(sizeStyle)) {
      editor.setStyleForNextShapes(DefaultSizeStyle, sizeStyle);
    }

    editor.store.listen(
      (entry) => {
        const { changes } = entry;
        const { added, updated, removed } = changes;

        const addedCount = Object.keys(added).length;
        const localShapes = editor.getCurrentPageShapes();
        const filteredShapes = localShapes?.filter((item) => item?.index !== 'a0') || [];
        const shapeNumberExceeded = filteredShapes
          .length + addedCount - 1 > maxNumberOfAnnotations;
        const invalidShapeType = Object.keys(added).find((id) => !isValidShapeType(added[id]));

        if (addedCount > 0 && (shapeNumberExceeded || invalidShapeType)) {
          // notify and undo last command without persisting
          // to not generate the onUndo/onRedo callback
          if (shapeNumberExceeded) {
            notifyShapeNumberExceeded(intl, maxNumberOfAnnotations);
          } else {
            notifyNotAllowedChange(intl);
          }
          // use remote to not trigger unwanted updates
          editor.store.mergeRemoteChanges(() => {
            editor.history.undo({ persist: false });
            const tool = editor.getCurrentToolId();
            editor.setCurrentTool('noop');
            editor.setCurrentTool(tool);
          });
        } else {
          // Add new shapes to the batch
          Object.values(added).forEach((record) => {
            const updatedRecord = {
              ...record,
              meta: {
                ...record.meta,
                createdBy: currentUser?.userId,
              },
            };

            shapeBatchRef.current[updatedRecord.id] = updatedRecord;
          });
        }

        // Update existing shapes and add them to the batch
        Object.values(updated).forEach(([, record]) => {
          const createdBy = prevShapesRef.current[record?.id]?.meta?.createdBy
            || currentUser?.userId;
          const updatedRecord = {
            ...record,
            meta: {
              createdBy,
              updatedBy: currentUser?.userId,
            },
          };

          const diff = getDifferences(prevShapesRef.current[record?.id], updatedRecord);

          if (diff) {
            diff.id = record.id;

            shapeBatchRef.current[updatedRecord.id] = diff;
          } else {
            shapeBatchRef.current[updatedRecord.id] = updatedRecord;
          }
        });

        // Handle removed shapes immediately (not batched)
        const idsToRemove = Object.keys(removed);
        if (idsToRemove.length > 0) {
          removeShapes(idsToRemove);
        }
      },
      { source: 'user', scope: 'document' },
    );

    editor.store.listen(
      (entry) => {
        const { changes } = entry;
        const { updated } = changes;
        const { 'pointer:pointer': pointers } = updated;

        const path = editor.getPath();

        if ((isPresenterRef.current || hasWBAccessRef.current) && pointers) {
          const [, nextPointer] = pointers;
          updateCursorPosition(nextPointer?.x, nextPointer?.y);
        }

        const camKey = `camera:page:${curPageIdRef.current}`;
        const { [camKey]: cameras } = updated;

        if (cameras) {
          const [prevCam, nextCam] = cameras;
          const panned = prevCam.x !== nextCam.x || prevCam.y !== nextCam.y;

          if (panned && isPresenterRef.current) {
            const viewedRegionW = SlideCalcUtil.calcViewedRegionWidth(
              editor?.getViewportPageBounds()?.w,
              currentPresentationPageRef.current?.scaledWidth,
            );
            const viewedRegionH = SlideCalcUtil.calcViewedRegionHeight(
              editor?.getViewportPageBounds()?.h,
              currentPresentationPageRef.current?.scaledHeight,
            );

            zoomSlide(
              viewedRegionW, viewedRegionH, nextCam.x, nextCam.y,
              currentPresentationPageRef.current,
            );
          }
        }

        // Check for idle states and persist the batch if there are shapes
        if (path === 'select.idle' || path === 'draw.idle' || path === 'select.editing_shape' || path === 'highlight.idle') {
          if (Object.keys(shapeBatchRef.current).length > 0) {
            const shapesToPersist = Object.values(shapeBatchRef.current);
            shapesToPersist.forEach((shape) => {
              persistShapeWrapper(
                shape,
                whiteboardIdRef.current,
                isModeratorRef.current,
              );
            });

            shapeBatchRef.current = {};
          }
        }
      },
      { source: 'user' },
    );

    if (editor && curPageIdRef.current) {
      const pages = [
        {
          meta: {},
          id: `page:${curPageIdRef.current}`,
          name: `Slide ${curPageIdRef.current}`,
          index: 'a1',
          typeName: 'page',
        },
      ];

      editor.store.mergeRemoteChanges(() => {
        editor.batch(() => {
          editor.store.put(pages);
          editor.store.put(assets);
          editor.setCurrentPage(`page:${curPageIdRef.current}`);
          editor.store.put(bgShape);
          editor.history.clear();
        });
      });

      const remoteShapes = shapes;
      const localShapes = editor.store.allRecords();
      const filteredShapes = localShapes.filter((item) => item?.typeName === 'shape') || [];

      const localShapesObj = {};
      filteredShapes.forEach((shape) => {
        localShapesObj[shape.id] = shape;
      });

      const shapesToAdd = [];
      Object.keys(remoteShapes).forEach((id) => {
        if (
          !localShapesObj[id]
          || JSON.stringify(remoteShapes[id])
            !== JSON.stringify(localShapesObj[id])
        ) {
          shapesToAdd.push(remoteShapes[id]);
        }
      });

      editor.store.mergeRemoteChanges(() => {
        if (shapesToAdd && shapesToAdd.length) {
          shapesToAdd.forEach((shape) => {
            const newShape = shape;
            delete newShape.isModerator;
            delete newShape.questionType;
          });
          editor.store.put(shapesToAdd);
        }
      });

      // eslint-disable-next-line no-param-reassign
      editor.store.onBeforeChange = (prev, next) => {
        const newNext = next;
        if (next?.typeName === 'instance_page_state') {
          if (isPresenterRef.current || isModeratorRef.current) return next;

          // Filter selectedShapeIds based on shape owner
          if (next.selectedShapeIds.length > 0
            && !isEqual(prev.selectedShapeIds, next.selectedShapeIds)
          ) {
            newNext.selectedShapeIds = next.selectedShapeIds.filter((shapeId) => {
              const shapeOwner = prevShapesRef.current[shapeId]?.meta?.createdBy;
              return !shapeOwner || shapeOwner === currentUser?.userId;
            });
          }

          if (!isEqual(prev.hoveredShapeId, next.hoveredShapeId)) {
            const hoveredShapeOwner = prevShapesRef.current[next.hoveredShapeId]?.meta?.createdBy;
            if (hoveredShapeOwner !== currentUser?.userId || next.hoveredShapeId?.includes('shape:BG-')) {
              newNext.hoveredShapeId = null;
            }
          }

          return newNext;
        }

        // Get viewport dimensions and bounds
        const viewportPageBounds = editor.getViewportPageBounds();
        const { w: viewportWidth, h: viewportHeight } = viewportPageBounds;

        const presentationWidth = currentPresentationPage?.scaledWidth || 0;
        const presentationHeightLocal = currentPresentationPage?.scaledHeight || 0;

        // Adjust camera position to ensure it stays within bounds
        const panned = next?.id?.includes('camera') && (prev.x !== next.x || prev.y !== next.y);
        if (panned && !currentPresentationPageRef.current?.infiniteWhiteboard) {
          // Horizontal bounds check
          if (next.x > 0) {
            newNext.x = 0;
          } else if (next.x < -(presentationWidth - viewportWidth)) {
            newNext.x = -(presentationWidth - viewportWidth);
          }

          // Vertical bounds check
          if (next.y > 0) {
            newNext.y = 0;
          } else if (next.y < -(presentationHeightLocal - viewportHeight)) {
            newNext.y = -(presentationHeightLocal - viewportHeight);
          }
        }

        return newNext;
      };

      editor.store.onAfterChange = (prev, next) => {
        if (next['selectedShapeIds'] && next['selectedShapeIds']?.some(id => id.includes('shape:BG'))) {
          bgSelectedRef.current = true;
        } else if ((next['selectedShapeIds'] && !next['selectedShapeIds']?.some(id => id.includes('shape:BG')))) {
          bgSelectedRef.current = false;
        }
      }

      if (!isPresenterRef.current && !hasWBAccessRef.current) {
        editor.setCurrentTool('noop');
      }
    }

    isMountedRef.current = true;
  };

  const shapesToRemove = React.useMemo(() => {
    if (isMouseDownRef.current) return [];
    const remoteShapeIds = Object.keys(prevShapesRef.current);
    const localShapes = tlEditorRef.current?.getCurrentPageShapes();
    const filteredShapes = localShapes?.filter((item) => item?.index !== 'a0') || [];
    return filteredShapes
      .filter((localShape) => !remoteShapeIds.includes(localShape.id))
      .map((localShape) => localShape.id);
  }, [prevShapesRef.current, curPageId]);

  const { shapesToAdd, shapesToUpdate } = React.useMemo(() => {
    const toAdd = [];
    const toUpdate = [];

    Object.values(prevShapesRef.current).forEach((remoteShape) => {
      if (!remoteShape.id) return;
      const localShapes = tlEditorRef.current?.getCurrentPageShapes();
      const filteredShapes = localShapes?.filter((item) => item?.index !== 'a0') || [];
      const localLookup = new Map(
        filteredShapes.map((shape) => [shape.id, shape]),
      );
      const localShape = localLookup.get(remoteShape.id);

      if (!localShape) {
        const newRemoteShape = remoteShape;
        delete newRemoteShape.isModerator;
        delete newRemoteShape.questionType;
        toAdd.push(newRemoteShape);
      } else {
        const remoteShapeMeta = remoteShape?.meta;
        const isCreatedByCurrentUser = remoteShapeMeta?.createdBy === currentUser?.userId;
        const isUpdatedByCurrentUser = remoteShapeMeta?.updatedBy === currentUser?.userId;

        // System-level shapes (background image) lack createdBy
        // and updatedBy metadata, which can cause false positives.
        // These cases expect an early return and shouldn't be updated.
        if (
          remoteShapeMeta && (
            (isCreatedByCurrentUser && isUpdatedByCurrentUser)
            || (!isCreatedByCurrentUser && isUpdatedByCurrentUser)
          )
        ) {
          return;
        }

        const diff = remoteShape;
        delete diff.isModerator;
        delete diff.questionType;
        toUpdate.push(diff);
      }
    });

    return {
      shapesToAdd: toAdd,
      shapesToUpdate: toUpdate,
    };
  }, [prevShapesRef.current, curPageId]);

  const setCamera = (zoom, x = 0, y = 0) => {
    if (tlEditorRef.current) {
      tlEditorRef.current.setCamera({ x, y, z: zoom }, { duration: 175 });
    }
  };

  const calculateZoomValue = (localWidth, localHeight) => {
    const calcedZoom = fitToWidth
      ? presentationAreaWidth / localWidth
      : Math.min(
        presentationAreaWidth / localWidth,
        presentationAreaHeight / localHeight,
      );

    return calcedZoom === 0 || calcedZoom === Infinity
      ? HUNDRED_PERCENT
      : calcedZoom;
  };

  const calculateZoomWithGapValue = (
    localWidth,
    localHeight,
    widthAdjustment = 0,
  ) => {
    const presentationWidth = presentationAreaWidth - widthAdjustment;
    const calcedZoom = (fitToWidth
      ? presentationWidth / localWidth
      : Math.min(
        presentationWidth / localWidth,
        presentationAreaHeight / localHeight,
      ));
    return calcedZoom === 0 || calcedZoom === Infinity
      ? HUNDRED_PERCENT
      : calcedZoom;
  };

  useMouseEvents(
    {
      whiteboardRef, tlEditorRef, isWheelZoomRef, initialZoomRef,
    },
    {
      isPresenter,
      hasWBAccess: hasWBAccessRef.current,
      whiteboardToolbarAutoHide,
      animations,
      publishCursorUpdate,
      whiteboardId: whiteboardIdRef.current,
      cursorPosition,
      updateCursorPosition,
      toggleToolsAnimations,
      currentPresentationPage,
      zoomChanger,
      setIsMouseDown,
      setIsWheelZoom,
      setWheelZoomTimeout,
    },
  );

  React.useEffect(() => {
    tlEditorRef.current = tlEditor;
  }, [tlEditor]);

  React.useEffect(() => {
    const handleArrowPress = (event) => {
      const currPageNum = parseInt(curPageIdRef.current, 10);
      const shapeSelected = tlEditorRef.current.getSelectedShapes()?.length > 0;
      const changeSlide = (direction) => {
        if (!currentPresentationPage) return;
        const newSlideNum = currPageNum + direction;
        const outOfBounds = direction > 0
          ? newSlideNum > currentPresentationPage?.totalPages
          : newSlideNum < 1;

        if (outOfBounds) return;

        skipToSlide(newSlideNum);
        zoomChanger(HUNDRED_PERCENT);
        zoomSlide(HUNDRED_PERCENT, HUNDRED_PERCENT, 0, 0);
      };

      if (!shapeSelected) {
        if (event.keyCode === KEY_CODES.ARROW_RIGHT) {
          changeSlide(1); // Move to the next slide
        } else if (event.keyCode === KEY_CODES.ARROW_LEFT) {
          changeSlide(-1); // Move to the previous slide
        }
      }
    };

    const handleKeyDown2 = (event) => {
      if (
        (event.keyCode === KEY_CODES.ARROW_RIGHT
          || event.keyCode === KEY_CODES.ARROW_LEFT)
        && isPresenterRef.current
      ) {
        handleArrowPress(event);
      }
    };

    const handleKeyUp = (event) => {
      if (event.key === ' ') {
        if (previousTool.current) {
          tlEditorRef.current?.setCurrentTool(previousTool.current);
          previousTool.current = null;
        }
      }
    };

    whiteboardRef.current?.addEventListener('keydown', handleKeyDown2, {
      capture: true,
    });
    whiteboardRef.current?.addEventListener('keyup', handleKeyUp, {
      capture: true,
    });

    return () => {
      whiteboardRef.current?.removeEventListener('keydown', handleKeyDown2);
      whiteboardRef.current?.removeEventListener('keyup', handleKeyUp);
    };
  }, [whiteboardRef.current]);

  React.useEffect(() => {
    zoomValueRef.current = zoomValue;
    let timeoutId = null;

    if (
      tlEditor
      && curPageIdRef.current
      && currentPresentationPage
      && isPresenter
      && isWheelZoomRef.current === false
    ) {
      const zoomLevelForReset = initialZoomRef.current
        || calculateZoomValue(
          currentPresentationPage.scaledWidth,
          currentPresentationPage.scaledHeight,
        );

      const zoomCamera = zoomValue === HUNDRED_PERCENT
        ? zoomLevelForReset
        : (zoomLevelForReset * zoomValue) / HUNDRED_PERCENT;
      const camera = tlEditorRef.current.getCamera();

      const nextCamera = {
        x:
          zoomValue === HUNDRED_PERCENT
            ? 0
            : (camera.x
              + (tlEditorRef.current.getViewportPageBounds().w / 2 / zoomCamera
              - tlEditorRef.current.getViewportPageBounds().w / 2 / camera.z)),
        y:
          zoomValue === HUNDRED_PERCENT
            ? 0
            : (camera.y
              + (tlEditorRef.current.getViewportPageBounds().h / 2 / zoomCamera
              - tlEditorRef.current.getViewportPageBounds().h / 2 / camera.z)),
        z: zoomCamera,
      };

      if (
        zoomValue !== prevZoomValueRef.current
        || zoomValue === HUNDRED_PERCENT
      ) {
        tlEditor.setCamera(nextCamera, { duration: 175 });

        timeoutId = setTimeout(() => {
          if (zoomValue === HUNDRED_PERCENT) {
            zoomChanger(HUNDRED_PERCENT);
            zoomSlide(HUNDRED_PERCENT, HUNDRED_PERCENT, 0, 0);
          } else {
            // Recalculate viewed region width and height for zoomSlide call
            const viewedRegionW = SlideCalcUtil.calcViewedRegionWidth(
              tlEditorRef.current.getViewportPageBounds().w,
              currentPresentationPage.scaledWidth,
            );
            const viewedRegionH = SlideCalcUtil.calcViewedRegionHeight(
              tlEditorRef.current.getViewportPageBounds().h,
              currentPresentationPage.scaledHeight,
            );

            zoomSlide(viewedRegionW, viewedRegionH, nextCamera.x, nextCamera.y);
          }
        }, 500);
      }
    }

    // Update the previous zoom value ref with the current zoom value
    prevZoomValueRef.current = zoomValue;
    return () => clearTimeout(timeoutId);
  }, [zoomValue, tlEditor, curPageId, isWheelZoomRef.current]);

  React.useEffect(() => {
    // A slight delay to ensure the canvas has rendered
    const timeoutId = setTimeout(() => {
      if (
        currentPresentationPage.scaledWidth > 0
        && currentPresentationPage.scaledHeight > 0
      ) {
        // Subtract the toolbar height from the presentation area height for the presenter
        const adjustedPresentationAreaHeight = isPresenter
          ? presentationAreaHeight - 40
          : presentationAreaHeight;
        const slideAspectRatio = currentPresentationPage.scaledWidth
          / currentPresentationPage.scaledHeight;
        const presentationAreaAspectRatio = presentationAreaWidth / adjustedPresentationAreaHeight;

        let initialZoom;

        if (slideAspectRatio > presentationAreaAspectRatio) {
          initialZoom = presentationAreaWidth / currentPresentationPage.scaledWidth;
        } else {
          initialZoom = adjustedPresentationAreaHeight
            / currentPresentationPage.scaledHeight;
        }

        initialZoomRef.current = initialZoom;
        prevZoomValueRef.current = zoomValue;
      }
    }, CAMERA_UPDATE_DELAY);

    return () => clearTimeout(timeoutId);
  }, [
    currentPresentationPage.scaledHeight,
    currentPresentationPage.scaledWidth,
    presentationAreaWidth,
    presentationAreaHeight,
    isPresenter,
    presentationId,
  ]);

  React.useEffect(() => {
    const handleResize = () => {
      if (!initialViewBoxWidthRef.current) {
        initialViewBoxWidthRef.current = currentPresentationPageRef.current?.scaledViewBoxWidth;
      }
      if (!initialViewBoxHeightRef.current) {
        initialViewBoxHeightRef.current = currentPresentationPageRef.current?.scaledViewBoxHeight;
      }
      // Calculate the absolute difference
      const heightDifference = Math.abs(
        presentationAreaHeight - lastKnownHeight.current,
      );
      const widthDifference = Math.abs(
        presentationAreaWidth - lastKnownWidth.current,
      );

      // Check if the difference is greater than the threshold
      if (heightDifference > THRESHOLD || widthDifference > THRESHOLD) {
        // Update the last known dimensions
        lastKnownHeight.current = presentationAreaHeight;
        lastKnownWidth.current = presentationAreaWidth;

        if (
          presentationAreaHeight > 0
          && presentationAreaWidth > 0
          && tlEditor
          && currentPresentationPage
          && currentPresentationPage.scaledWidth > 0
          && currentPresentationPage.scaledHeight > 0
        ) {
          const currentZoom = zoomValueRef.current || HUNDRED_PERCENT;
          const baseZoom = calculateZoomValue(
            currentPresentationPageRef.current.scaledWidth,
            currentPresentationPageRef.current.scaledHeight
          );
          let adjustedZoom = baseZoom * (currentZoom / HUNDRED_PERCENT);
          if (isPresenter) {
            const container = document.querySelector(
              '[data-test="presentationContainer"]',
            );
            const innerWrapper = document.getElementById(
              'presentationInnerWrapper',
            );
            const containerWidth = container ? container.offsetWidth : 0;
            const innerWrapperWidth = innerWrapper
              ? innerWrapper.offsetWidth
              : 0;
            const widthGap = Math.max(containerWidth - innerWrapperWidth, 0);
            const camera = tlEditorRef.current.getCamera();

            if (widthGap > 0) {
              adjustedZoom = calculateZoomWithGapValue(
                currentPresentationPageRef.current.scaledWidth,
                currentPresentationPageRef.current.scaledHeight,
                widthGap,
              );

              adjustedZoom *= currentZoom / HUNDRED_PERCENT;
            } else {
              adjustedZoom = baseZoom * (currentZoom / HUNDRED_PERCENT);
            }

            const zoomToApply = widthGap > 0
              ? adjustedZoom
              : baseZoom * (currentZoom / HUNDRED_PERCENT);

            const formattedPageId = Number(curPageIdRef?.current);

            let updatedCurrentCam = {
              ...camera,
              z: adjustedZoom
            };

            let cameras = [
              createCamera(formattedPageId - 1, zoomToApply),
              updatedCurrentCam,
              createCamera(formattedPageId + 1, zoomToApply),
            ];
            cameras = cameras.filter(camera => camera.id !== 'camera:page:0');
            tlEditorRef.current.store.put(cameras);
          } else {
            // Viewer logic
            const effectiveZoom = calculateEffectiveZoom(
              initialViewBoxWidthRef.current,
              currentPresentationPageRef.current.scaledViewBoxWidth,
              initialViewBoxHeightRef.current,
              currentPresentationPageRef.current.scaledViewBoxHeight
            );
            adjustedZoom = baseZoom * (effectiveZoom / HUNDRED_PERCENT);

            const camera = tlEditorRef.current.getCamera();
            const formattedPageId = Number(curPageIdRef?.current);
            let updatedCurrentCam = {
              ...camera,
              z: adjustedZoom
            };

            let cameras = [
              createCamera(formattedPageId - 1, adjustedZoom),
              updatedCurrentCam,
              createCamera(formattedPageId + 1, adjustedZoom),
            ];
            cameras = cameras.filter(camera => camera.id !== 'camera:page:0');
            tlEditorRef.current.store.put(cameras);
          }
        }
      }
    };

    const timeoutId = setTimeout(handleResize, CAMERA_UPDATE_DELAY);

    return () => clearTimeout(timeoutId);
  }, [presentationAreaHeight, presentationAreaWidth, curPageId, presentationId]);

  React.useEffect(() => {
    if (!fitToWidth && isPresenter) {
      zoomChanger(HUNDRED_PERCENT);
      zoomSlide(HUNDRED_PERCENT, HUNDRED_PERCENT, 0, 0);
    }
  }, [fitToWidth, isPresenter]);

  React.useEffect(() => {
    if (!isPresenter
      && tlEditorRef.current
      && initialViewBoxWidthRef.current
      && initialViewBoxHeightRef.current
      && currentPresentationPage
    ) {
      const effectiveZoom = calculateEffectiveZoom(
        initialViewBoxWidthRef.current,
        currentPresentationPage.scaledViewBoxWidth,
        initialViewBoxHeightRef.current,
        currentPresentationPage.scaledViewBoxHeight,
      );

      const adjustedZoom = calculateZoomValue(
        currentPresentationPage.scaledWidth,
        currentPresentationPage.scaledHeight,
      ) * (effectiveZoom / HUNDRED_PERCENT);

      const adjustedXPos = currentPresentationPage.xOffset;
      const adjustedYPos = currentPresentationPage.yOffset;

      setCamera(
        adjustedZoom,
        adjustedXPos,
        adjustedYPos,
      );
    }
  }, [currentPresentationPage]);

  React.useEffect(() => {
    if (shapesToAdd.length || shapesToUpdate.length || shapesToRemove.length) {
      const tlStoreUpdateTimeoutId = setTimeout(() => {
        tlEditor?.store?.mergeRemoteChanges(() => {
          if (shapesToRemove.length > 0) {
            tlEditor?.store?.remove(shapesToRemove);
          }
          if (shapesToAdd.length) {
            tlEditor?.store?.put(shapesToAdd);
          }
          if (shapesToUpdate.length) {
            const updatedShapes = shapesToUpdate.map((shape) => {
              const currentShape = tlEditor?.getShape(shape.id);
              if (currentShape) {
                return { ...currentShape, ...shape };
              }
              return null;
            }).filter(Boolean);

            if (updatedShapes.length) {
              tlEditor?.store?.put(updatedShapes);
            }
          }
        });
      }, 300);

      return () => clearTimeout(tlStoreUpdateTimeoutId);
    }
    return undefined;
  }, [shapesToAdd, shapesToUpdate, shapesToRemove]);

  // Updating presences in tldraw store based on changes in cursors
  React.useEffect(() => {
    if (tlEditorRef.current) {
      const useElement = document.querySelector('.tl-cursor use');
      if (useElement && !isMultiUserActive && !isPresenter) {
        useElement.setAttribute('href', '#redPointer');
      } else if (useElement) {
        useElement.setAttribute('href', '#cursor');
      }

      const idsToRemove = [];

      // Get all presence records from the store
      const allRecords = tlEditorRef.current.store.allRecords();
      const presenceRecords = allRecords.filter((record) => record.id.startsWith('instance_presence:'));

      // Check if any presence records correspond to users not in whiteboardWriters
      presenceRecords.forEach((record) => {
        const userId = record.userId.split('instance_presence:')[1];
        const hasAccessToWhiteboard = whiteboardWriters.some((writer) => writer.userId === userId);

        if (!hasAccessToWhiteboard) {
          idsToRemove.push(record.id);
        }
      });

      const updatedPresences = otherCursors
        .map(({
          userId, user, xPercent, yPercent,
        }) => {
          const { presenter, name } = user;
          const id = InstancePresenceRecordType.createId(userId);
          const active = xPercent !== -1 && yPercent !== -1;
          // if cursor is not active remove it from tldraw store
          if (
            !active
            || (hideViewersCursor
              && user.role === 'VIEWER'
              && !currentUser?.presenter)
            || (!presenter && !isMultiUserActive)
          ) {
            idsToRemove.push(id);
            return null;
          }

          const cursor = {
            x: xPercent,
            y: yPercent,
            type: 'default',
            rotation: 0,
          };
          const color = presenter ? '#FF0000' : '#70DB70';
          const c = {
            ...InstancePresenceRecordType.create({
              id,
              currentPageId: `page:${curPageIdRef.current}`,
              userId,
              userName: name,
              cursor,
              color,
            }),
            lastActivityTimestamp: Date.now(),
          };

          return c;
        })
        .filter((cursor) => cursor && cursor.userId !== currentUser?.userId);

      if (idsToRemove.length) {
        tlEditorRef.current?.store.remove(idsToRemove);
      }

      // If there are any updated presences, put them all in the store
      if (updatedPresences.length) {
        tlEditorRef.current?.store.put(updatedPresences);
      }
    }
  }, [otherCursors, whiteboardWriters]);

  const createPage = (currentPageId) => {
    return [
      {
        meta: {},
        id: currentPageId,
        name: `Slide ${currentPageId?.split(':')[1]}`,
        index: 'a1',
        typeName: 'page',
      },
    ];
  }

  const createCameras = (pageId, tlZ) => {
    const cameras = [];
    const MIN_PAGE_ID = 1;
    const totalPages = currentPresentationPageRef.current?.totalPages || 1;

    if (pageId > MIN_PAGE_ID) {
      cameras.push(createCamera(pageId - 1, tlZ));
    }

    cameras.push(createCamera(pageId, tlZ));

    if (pageId < totalPages) {
      cameras.push(createCamera(pageId + 1, tlZ));
    }

    return cameras;
  }

  const cleanupStore = (currentPageId) => {
    const allRecords = tlEditorRef.current.store.allRecords();
    const shapeIdsToRemove = allRecords
      .filter(record => record.typeName === 'shape' && record.parentId && record.parentId !== currentPageId)
      .map(shape => shape.id);

    if (shapeIdsToRemove.length > 0) {
      tlEditorRef.current.deleteShapes(shapeIdsToRemove);
    }
  }

  const updateStore = (pages, cameras) => {
    tlEditorRef.current.store.put(pages);
    tlEditorRef.current.store.put(cameras);
    tlEditorRef.current.store.put(assets);
    tlEditorRef.current.store.put(bgShape);
  }

  const finalizeStore = () => {
    tlEditorRef.current.history.clear();
  }

  const toggleToolbarIfNeeded = () => {
    if (whiteboardToolbarAutoHide && toggleToolsAnimations) {
      toggleToolsAnimations("fade-in", "fade-out", "0s", hasWBAccessRef.current || isPresenterRef.current);
    }
  }

  const resetSlideState = () => {
    slideChanged.current = false;
    slideNext.current = null;
  }

  React.useEffect(() => {
    const formattedPageId = parseInt(curPageIdRef.current, 10);
    if (tlEditorRef.current && formattedPageId !== 0) {
      const currentPageId = `page:${formattedPageId}`;
      const tlZ = tlEditorRef.current.getCamera()?.z;

      const pages = createPage(currentPageId);
      const cameras = createCameras(formattedPageId, tlZ);

      tlEditorRef.current.store.mergeRemoteChanges(() => {
        tlEditorRef.current.batch(() => {
          cleanupStore(currentPageId);
          updateStore(pages, cameras);
          tlEditorRef.current.setCurrentPage(currentPageId);
          finalizeStore();
        });
      });

      toggleToolbarIfNeeded();
      resetSlideState();
    }
  }, [curPageId]);

  const adjustCameraOnMount = (includeViewerLogic = true) => {
    if (presenterChanged) {
      localStorage.removeItem('initialViewBoxWidth');
      localStorage.removeItem('initialViewBoxHeight');
    }

    const storedWidth = localStorage.getItem('initialViewBoxWidth');
    const storedHeight = localStorage.getItem('initialViewBoxHeight');
    if (storedWidth && storedHeight) {
      initialViewBoxWidthRef.current = parseFloat(storedWidth);
      initialViewBoxHeightRef.current = parseFloat(storedHeight);
    } else {
      const currentZoomLevel = currentPresentationPageRef.current.scaledWidth
                             / currentPresentationPageRef.current.scaledViewBoxWidth;
      const calculatedWidth = currentZoomLevel !== 1
        ? currentPresentationPageRef.current.scaledWidth / currentZoomLevel
        : currentPresentationPageRef.current.scaledWidth;
      const calculatedHeight = currentZoomLevel !== 1
        ? currentPresentationPageRef.current.scaledHeight / currentZoomLevel
        : currentPresentationPageRef.current.scaledHeight;

      initialViewBoxWidthRef.current = calculatedWidth;
      initialViewBoxHeightRef.current = calculatedHeight;
      localStorage.setItem('initialViewBoxWidth', calculatedWidth.toString());
      localStorage.setItem('initialViewBoxHeight', calculatedHeight.toString());
    }

    setTimeout(() => {
      if (
        presentationAreaHeight > 0
        && presentationAreaWidth > 0
        && currentPresentationPageRef.current
        && currentPresentationPageRef.current.scaledWidth > 0
        && currentPresentationPageRef.current.scaledHeight > 0
      ) {
        const adjustedPresentationAreaHeight = isPresenter
          ? presentationAreaHeight - 40
          : presentationAreaHeight;

        const effectiveZoom = calculateEffectiveZoom(
          initialViewBoxWidthRef.current,
          currentPresentationPageRef.current.scaledViewBoxWidth,
          initialViewBoxHeightRef.current,
          currentPresentationPageRef.current.scaledViewBoxHeight,
        );

        let baseZoom;
        if (isPresenter) {
          baseZoom = fitToWidth
            ? presentationAreaWidth / currentPresentationPageRef.current.scaledWidth
            : Math.min(
              presentationAreaWidth / currentPresentationPageRef.current.scaledWidth,
              adjustedPresentationAreaHeight / currentPresentationPageRef.current.scaledHeight,
            );

          const zoomAdjustmentFactor = currentPresentationPageRef.current.scaledWidth
                                    / currentPresentationPageRef.current.scaledViewBoxWidth;
          baseZoom *= zoomAdjustmentFactor;

          const adjustedXPos = currentPresentationPageRef.current.xOffset;
          const adjustedYPos = currentPresentationPageRef.current.yOffset;

          setCamera(baseZoom, adjustedXPos, adjustedYPos);
        } else if (includeViewerLogic) {
          baseZoom = Math.min(
            presentationAreaWidth / currentPresentationPageRef.current.scaledWidth,
            adjustedPresentationAreaHeight / currentPresentationPageRef.current.scaledHeight,
          );

          const zoomAdjustmentFactor = currentPresentationPageRef.current.scaledWidth
                                     / currentPresentationPageRef.current.scaledViewBoxWidth;
          baseZoom *= zoomAdjustmentFactor;

          const presenterXOffset = currentPresentationPageRef.current.xOffset;
          const presenterYOffset = currentPresentationPageRef.current.yOffset;

          const adjustedXPos = isInfiniteWhiteboard
            ? presenterXOffset
            : presenterXOffset * effectiveZoom;
          const adjustedYPos = isInfiniteWhiteboard
            ? presenterYOffset
            : presenterYOffset * effectiveZoom;

          setCamera(baseZoom, adjustedXPos, adjustedYPos);
        }
      }
    }, CAMERA_UPDATE_DELAY);
  };

  React.useEffect(() => {
    if (isMountedRef.current) {
      adjustCameraOnMount(true);
    }
  }, [
    isMountedRef.current,
    presentationId,
    curPageId,
    isMultiUserActive,
    isPresenter,
    animations,
    locale,
    whiteboardToolbarAutoHide,
    darkTheme,
    isInfiniteWhiteboard,
  ]);

  React.useEffect(() => {
    if (isMountedRef.current) {
      adjustCameraOnMount(false);
    }
  }, [
    isMountedRef.current,
    selectedLayout,
    isInfiniteWhiteboard,
  ]);

  React.useEffect(() => {
    setTldrawIsMounting(true);
    return () => {
      isMountedRef.current = false;
      localStorage.removeItem('initialViewBoxWidth');
      localStorage.removeItem('initialViewBoxHeight');
    };
  }, []);

  React.useEffect(() => {
    if (isMounting) {
      setIsMounting(false);
      /// brings presentation toolbar back
      setTldrawIsMounting(false);
    }
  }, [
    tlEditorRef?.current?.camera,
    presentationAreaWidth,
    presentationAreaHeight,
    presentationId,
  ]);

  React.useEffect(() => {
    const bbbMultiUserTools = getFromUserSettings(
      'bbb_multi_user_tools',
      meetingClientSettingsInitialValues.public.whiteboard.toolbar.multiUserTools,
    );
    const allElements = document.querySelectorAll('[data-testid^="tools."]');

    if (bbbMultiUserTools.length >= 1 && !isModerator) {
      allElements.forEach((element) => {
        const toolName = element.getAttribute('data-testid').split('.')[1];

        if (!bbbMultiUserTools.includes(toolName)) {
          // eslint-disable-next-line no-param-reassign
          element.style.display = 'none';
        }
      });
    }
  // TODO: we should add the dependency  list in [] parameter here
  // so this is not run on every render
  });

  React.useEffect(() => {
    const bbbPresenterTools = getFromUserSettings(
      'bbb_presenter_tools',
      meetingClientSettingsInitialValues.public.whiteboard.toolbar.presenterTools,
    );
    const allElements = document.querySelectorAll('[data-testid^="tools."]');

    if (bbbPresenterTools.length >= 1 && isPresenter) {
      allElements.forEach((element) => {
        const toolName = element.getAttribute('data-testid').split('.')[1];

        if (!bbbPresenterTools.includes(toolName)) {
          // eslint-disable-next-line no-param-reassign
          element.style.display = 'none';
        }
      });
    }
  // TODO: we should add the dependency  list in [] parameter here
  // so this is not run on every render
  });

  React.useEffect(() => {
    const bbbMultiUserPenOnly = getFromUserSettings(
      'bbb_multi_user_pen_only',
      false,
    );
    const allElements = document.querySelectorAll('[data-testid^="tools."]');

    if (bbbMultiUserPenOnly && !isModerator && !isPresenter) {
      allElements.forEach((element) => {
        const toolName = element.getAttribute('data-testid').split('.')[1];

        const displayStyle = toolName !== 'draw' ? 'none' : 'flex';
        // eslint-disable-next-line no-param-reassign
        element.style.display = displayStyle;
      });
    }
  // TODO: we should add the dependency  list in [] parameter here
  // so this is not run on every render
  });

  return (
    <div
      ref={whiteboardRef}
      id="whiteboard-element"
      key={`animations=-${animations}-${whiteboardToolbarAutoHide}-${language}-${presentationId}`}
    >
      <Tldraw
        autoFocus={false}
        key={`tldrawv2-${presentationId}-${animations}-${isInfiniteWhiteboard}`}
        forceMobile
        hideUi={!(hasWBAccessRef.current || isPresenter)}
        onMount={handleTldrawMount}
        tools={customTools}
      />
      <Styled.TldrawV2GlobalStyle
        {...{
          hasWBAccess: hasWBAccessRef.current,
          bgSelected: bgSelectedRef.current,
          isPresenter,
          isRTL,
          isMultiUserActive,
          isToolbarVisible,
          presentationHeight,
        }}
      />
    </div>
  );
});

export default Whiteboard;

Whiteboard.propTypes = {
  isPresenter: PropTypes.bool,
  removeShapes: PropTypes.func.isRequired,
  persistShapeWrapper: PropTypes.func.isRequired,
  notifyNotAllowedChange: PropTypes.func.isRequired,
  shapes: PropTypes.objectOf(PropTypes.shape).isRequired,
  assets: PropTypes.arrayOf(PropTypes.shape).isRequired,
  currentUser: PropTypes.shape({
    userId: PropTypes.string.isRequired,
  }),
  whiteboardId: PropTypes.string,
  zoomSlide: PropTypes.func.isRequired,
  curPageNum: PropTypes.number.isRequired,
  presentationHeight: PropTypes.number.isRequired,
  zoomChanger: PropTypes.func.isRequired,
  isRTL: PropTypes.bool.isRequired,
  fitToWidth: PropTypes.bool.isRequired,
  zoomValue: PropTypes.number.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  colorStyle: PropTypes.string.isRequired,
  dashStyle: PropTypes.string.isRequired,
  fillStyle: PropTypes.string.isRequired,
  fontStyle: PropTypes.string.isRequired,
  sizeStyle: PropTypes.string.isRequired,
  presentationAreaHeight: PropTypes.number.isRequired,
  presentationAreaWidth: PropTypes.number.isRequired,
  maxNumberOfAnnotations: PropTypes.number.isRequired,
  darkTheme: PropTypes.bool.isRequired,
  setTldrawIsMounting: PropTypes.func.isRequired,
  presentationId: PropTypes.string,
  setTldrawAPI: PropTypes.func.isRequired,
  isMultiUserActive: PropTypes.bool,
  whiteboardToolbarAutoHide: PropTypes.bool,
  toggleToolsAnimations: PropTypes.func.isRequired,
  animations: PropTypes.bool,
  isToolbarVisible: PropTypes.bool,
  isModerator: PropTypes.bool,
  currentPresentationPage: PropTypes.shape(),
  hasWBAccess: PropTypes.bool,
  bgShape: PropTypes.arrayOf(PropTypes.shape).isRequired,
  publishCursorUpdate: PropTypes.func.isRequired,
  otherCursors: PropTypes.arrayOf(PropTypes.shape).isRequired,
  hideViewersCursor: PropTypes.bool,
  skipToSlide: PropTypes.func.isRequired,
  locale: PropTypes.string.isRequired,
  selectedLayout: PropTypes.string.isRequired,
  isInfiniteWhiteboard: PropTypes.bool,
  whiteboardWriters: PropTypes.arrayOf(PropTypes.shape).isRequired,
};
