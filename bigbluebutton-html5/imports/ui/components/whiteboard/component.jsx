import * as React from 'react';
import PropTypes from 'prop-types';
import { useRef, useCallback } from 'react';
import { isEqual } from 'radash';
import {
  Tldraw,
  DefaultColorStyle,
  DefaultDashStyle,
  DefaultFillStyle,
  DefaultFontStyle,
  DefaultSizeStyle,
  DefaultHorizontalAlignStyle,
  DefaultVerticalAlignStyle,
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

const createCamera = (pageId, zoomLevel) => ({
  id: `camera:page:${pageId}`,
  meta: {},
  typeName: CAMERA_TYPE,
  x: 0,
  y: 0,
  z: zoomLevel,
});

const createLookup = (arr) =>
  arr.reduce((acc, entry) => {
    acc[entry.id] = entry;
    return acc;
  }, {});

const defaultUser = {
  userId: '',
};

const Whiteboard = React.memo((props) => {
  const {
    isPresenter = false,
    removeShapes,
    persistShapeWrapper,
    shapes,
    removedShapes,
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
    presentationWidth,
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
    isPhone,
    setEditor,
  } = props;

  clearTldrawCache();

  const [tlEditor, setTlEditor] = React.useState(null);
  const [isMounting, setIsMounting] = React.useState(true);
  const [isTabVisible, setIsTabVisible] = React.useState(document.visibilityState === 'visible');

  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setIsTabVisible(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

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
  const fitToWidthRef = useRef(fitToWidth);
  const whiteboardIdRef = React.useRef(whiteboardId);
  const curPageIdRef = React.useRef(curPageId);
  const hasWBAccessRef = React.useRef(hasWBAccess);
  const isModeratorRef = React.useRef(isModerator);
  const currentPresentationPageRef = React.useRef(currentPresentationPage);
  const initialViewBoxWidthRef = React.useRef(null);
  const initialViewBoxHeightRef = React.useRef(null);
  const previousTool = React.useRef(null);
  const bgSelectedRef = React.useRef(false);
  const lastVisibilityStateRef = React.useRef('');
  const mountedTimeoutIdRef = useRef(null);

  const CAMERA_UPDATE_DELAY = 650;
  const MOUNTED_CAMERA_DELAY = 500;

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

  const sanitizeShape = (shape) => {
    const { isModerator, questionType, ...rest } = shape;
    return {
      ...rest,
    };
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
    fitToWidthRef.current = fitToWidth;
  }, [fitToWidth]);

  React.useEffect(() => {
    if (shapes && Object.keys(shapes).length > 0) {
      prevShapesRef.current = shapes;
      const remoteShapesArray = Object.values(shapes).map((shape) => sanitizeShape(shape));
      tlEditorRef.current?.store.mergeRemoteChanges(() => {
        tlEditorRef.current?.store.put(remoteShapesArray);
      });
    }
  }, [shapes]);

  React.useEffect(() => {
    if (removedShapes && removedShapes.length > 0) {
      tlEditorRef.current?.store.remove([...removedShapes]);
    }
  }, [removedShapes]);

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
    // ignore if the edit link dialog is open
    if (document.querySelector('h2.tlui-dialog__header__title')?.textContent === 'Edit link') {
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

    if (['delete', 'backspace'].includes(key.toLowerCase())) {
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

  let cameraUpdateTimeoutId = null;

  const adjustCameraOnMount = (includeViewerLogic = true) => {
    // Clear any existing timeout to prevent overlaps
    if (cameraUpdateTimeoutId) {
      clearTimeout(cameraUpdateTimeoutId);
    }

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

    cameraUpdateTimeoutId = setTimeout(() => {
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
          baseZoom = calculateZoomValue(
            currentPresentationPageRef.current.scaledViewBoxWidth,
            currentPresentationPageRef.current.scaledViewBoxHeight,
          );

          const presenterXOffset = currentPresentationPageRef.current.xOffset;
          const presenterYOffset = currentPresentationPageRef.current.yOffset;

          const adjustedXPos = isInfiniteWhiteboard
            ? presenterXOffset
            : currentPresentationPageRef.current.xOffset;
          const adjustedYPos = isInfiniteWhiteboard
            ? presenterYOffset
            : currentPresentationPageRef.current.yOffset;

          setCamera(baseZoom, adjustedXPos, adjustedYPos);
        }

        isMountedRef.current = true;

      }
    }, MOUNTED_CAMERA_DELAY);
  };

  const handleTldrawMount = (editor) => {
    setTlEditor(editor);
    setTldrawAPI(editor);
    setEditor(editor);

    DefaultHorizontalAlignStyle.defaultValue = isRTL ? 'end' : 'start';
    DefaultVerticalAlignStyle.defaultValue = 'start';

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
          const formattedLookup = createLookup(editor.getCurrentPageShapes());
          const createdBy = formattedLookup[record?.id]?.meta?.createdBy || currentUser?.userId;
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

          const zoomed = prevCam.z !== nextCam.z;

          if ((panned || (zoomed && fitToWidthRef.current)) && isPresenterRef.current) {
            const viewedRegionW = SlideCalcUtil.calcViewedRegionWidth(
              editor?.getViewportPageBounds()?.w,
              currentPresentationPageRef.current?.scaledWidth,
            );
            const viewedRegionH = SlideCalcUtil.calcViewedRegionHeight(
              editor?.getViewportPageBounds()?.h,
              currentPresentationPageRef.current?.scaledHeight,
            );

            if (isMountedRef.current) {
              zoomSlide(
                viewedRegionW, viewedRegionH, nextCam.x, nextCam.y,
                currentPresentationPageRef.current,
              );
            }
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

      const hasShapes = shapes && Object.keys(shapes).length > 0;
      const remoteShapesArray = hasShapes 
        ? Object.values(shapes).map((shape) => sanitizeShape(shape))
        : [];

      editor.store.mergeRemoteChanges(() => {
        editor.batch(() => {
          editor.store.put(pages);
          editor.store.put(assets);
          editor.setCurrentPage(`page:${curPageIdRef.current}`);
          editor.store.put(bgShape);
          if (hasShapes) {
            editor.store.put(remoteShapesArray);
          }
          editor.history.clear();
        });
      });

      // eslint-disable-next-line no-param-reassign
      editor.store.onBeforeChange = (prev, next) => {
        if (isPhone) {
          const path = editor.getPath();
          const activePaths = [
            'draw.drawing',
            'eraser.erasing',
            'select.dragging_handle',
            'select.resizing',
            'select.translating',
            'select.rotating',
            'select.editing_shape',
            'hand.pointing',
            'hand.dragging',
            'geo.pointing',
            'line.pointing',
            'highlight.drawing',
          ];
          const idlePaths = [
            'draw.idle',
            'eraser.idle',
            'select.idle',
            'hand.idle',
            'highlight.idle',
          ];

          let visibilityState = null;
          if (activePaths.includes(path)) {
            visibilityState = 'visible';
          } else if (idlePaths.includes(path)) {
            visibilityState = 'hidden';
          }

          if (visibilityState && visibilityState !== lastVisibilityStateRef.current) {
            if (visibilityState === 'visible') {
              toggleToolsAnimations(
                'fade-in',
                'fade-out',
                '0s',
                hasWBAccessRef.current || isPresenterRef.current,
              );
            } else if (visibilityState === 'hidden') {
              toggleToolsAnimations(
                'fade-out',
                'fade-in',
                '0s',
                hasWBAccessRef.current || isPresenterRef.current,
              );
            }
            lastVisibilityStateRef.current = visibilityState;
          }
        }

        const newNext = next;
        if (next?.typeName === 'instance_page_state') {
          if (isPresenterRef.current || isModeratorRef.current) return next;
          const formattedLookup = createLookup(editor.getCurrentPageShapes());

          // Filter selectedShapeIds based on shape owner
          if (next.selectedShapeIds.length > 0) {
            newNext.selectedShapeIds = next.selectedShapeIds.filter((shapeId) => {
              const shapeOwner = formattedLookup[shapeId]?.meta?.createdBy;
              return !shapeOwner || shapeOwner === currentUser?.userId;
            });
          }

          if (!isEqual(prev.hoveredShapeId, next.hoveredShapeId)) {
            const hoveredShapeOwner = formattedLookup[next.hoveredShapeId]?.meta?.createdBy;
            if (hoveredShapeOwner !== currentUser?.userId || next.hoveredShapeId?.includes('shape:BG-')) {
              newNext.hoveredShapeId = null;
            }
          }

          return newNext;
        }

        // Get viewport dimensions and bounds
        let viewportWidth;
        let viewportHeight;

        if (isPresenterRef.current) {
          const viewportPageBounds = editor?.getViewportPageBounds();
          viewportWidth = viewportPageBounds?.w;
          viewportHeight = viewportPageBounds?.h;
        } else {
          viewportWidth = currentPresentationPageRef.current?.scaledViewBoxWidth;
          viewportHeight = currentPresentationPageRef.current?.scaledViewBoxHeight;
        }

        const presentationWidthLocal = currentPresentationPageRef.current?.scaledWidth || 0;
        const presentationHeightLocal = currentPresentationPageRef.current?.scaledHeight || 0;

        // Adjust camera position to ensure it stays within bounds
        const panned = next?.id?.includes('camera') && (prev.x !== next.x || prev.y !== next.y);
        if (panned && !currentPresentationPageRef.current?.infiniteWhiteboard) {
          // Horizontal bounds check
          if (next.x > 0) {
            newNext.x = 0;
          } else if (next.x < -(presentationWidthLocal - viewportWidth)) {
            newNext.x = -(presentationWidthLocal - viewportWidth);
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

      // eslint-disable-next-line no-param-reassign
      editor.store.onAfterChange = (prev, next) => {
        if (next.selectedShapeIds && next.selectedShapeIds?.some((id) => id.includes('shape:BG'))) {
          bgSelectedRef.current = true;
        } else if ((next.selectedShapeIds && !next.selectedShapeIds?.some((id) => id.includes('shape:BG')))) {
          bgSelectedRef.current = false;
        }
      };

      if (!isPresenterRef.current && !hasWBAccessRef.current) {
        editor.setCurrentTool('noop');
      }
    }

    mountedTimeoutIdRef.current = setTimeout(() => {
      adjustCameraOnMount(!isPresenterRef.current);
    }, MOUNTED_CAMERA_DELAY);
  };

  const calculateZoomWithGapValue = (
    localWidth,
    localHeight,
    widthAdjustment = 0,
  ) => {
    const presentationWidthLocal = presentationAreaWidth - widthAdjustment;
    const calcedZoom = (fitToWidth
      ? presentationWidthLocal / localWidth
      : Math.min(
        presentationWidthLocal / localWidth,
        presentationAreaHeight / localHeight,
      ));
    return calcedZoom === 0 || calcedZoom === Infinity
      ? HUNDRED_PERCENT
      : calcedZoom;
  };

  useMouseEvents(
    {
      whiteboardRef, tlEditorRef, isWheelZoomRef, initialZoomRef, isPresenterRef,
    },
    {
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
      isInfiniteWhiteboard,
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
      tlEditor &&
      curPageIdRef.current &&
      currentPresentationPage &&
      isPresenter &&
      !isWheelZoomRef.current
    ) {
      const zoomLevelForReset =
        fitToWidthRef.current || !initialZoomRef.current
          ? calculateZoomValue(
              currentPresentationPage.scaledWidth,
              currentPresentationPage.scaledHeight
            )
          : initialZoomRef.current;

      const zoomCamera = (zoomLevelForReset * zoomValue) / HUNDRED_PERCENT;
      const slideShape = tlEditorRef.current.getShape(`shape:BG-${curPageIdRef.current}`);
      const camera = tlEditorRef.current.getCamera();

      const viewportScreenBounds = tlEditorRef.current.getViewportScreenBounds();
      const viewportWidth = viewportScreenBounds.width;
      const viewportHeight = viewportScreenBounds.height;

      let newCamera;

      if (slideShape) {
        const centeredCameraX =
          -slideShape.x +
          (viewportWidth - slideShape.props.w * camera.z) / (2 * camera.z);
        const centeredCameraY =
          -slideShape.y +
          (viewportHeight - slideShape.props.h * camera.z) / (2 * camera.z);

        let panningOffsetX = 0;
        let panningOffsetY = 0;

        if (zoomValue !== 100) {
          panningOffsetX = camera.x - centeredCameraX;
          panningOffsetY = camera.y - centeredCameraY;
        }

        const newCenteredCameraX =
          -slideShape.x +
          (viewportWidth - slideShape.props.w * zoomCamera) / (2 * zoomCamera);
        const newCenteredCameraY =
          -slideShape.y +
          (viewportHeight - slideShape.props.h * zoomCamera) / (2 * zoomCamera);

        newCamera = {
          x: newCenteredCameraX + panningOffsetX,
          y: newCenteredCameraY + panningOffsetY,
          z: zoomCamera,
        };
      } else {
        newCamera = {
          x:
            camera.x +
            ((viewportWidth / 2) / camera.z - (viewportWidth / 2) / zoomCamera),
          y:
            camera.y +
            ((viewportHeight / 2) / camera.z - (viewportHeight / 2) / zoomCamera),
          z: zoomCamera,
        };
      }

      if (newCamera) {
        tlEditorRef.current.setCamera(newCamera, { duration: 175 });
      }

      timeoutId = setTimeout(() => {
        const viewportBounds = tlEditorRef.current.getViewportPageBounds();
        const viewedRegionW = SlideCalcUtil.calcViewedRegionWidth(
          viewportBounds.w,
          currentPresentationPageRef.current.scaledWidth
        );
        const viewedRegionH = SlideCalcUtil.calcViewedRegionHeight(
          viewportBounds.h,
          currentPresentationPageRef.current.scaledHeight
        );
        const updatedCamera = tlEditorRef.current.getCamera();

        zoomSlide(
          viewedRegionW,
          viewedRegionH,
          updatedCamera.x,
          updatedCamera.y,
          currentPresentationPageRef.current
        );
      }, 500);
    }

    prevZoomValueRef.current = zoomValue;
    return () => clearTimeout(timeoutId);
  }, [
    zoomValue, tlEditor, curPageId, isWheelZoomRef.current, fitToWidthRef.current,
  ]);

  React.useEffect(() => {
    // A slight delay to ensure the canvas has rendered
    const timeoutId = setTimeout(() => {
      if (
        currentPresentationPageRef.current.scaledWidth > 0
        && currentPresentationPageRef.current.scaledHeight > 0
      ) {
        // Subtract the toolbar height from the presentation area height for the presenter
        const adjustedPresentationAreaHeight = isPresenter
          ? presentationAreaHeight - 40
          : presentationAreaHeight;
        const slideAspectRatio = currentPresentationPageRef.current.scaledWidth
          / currentPresentationPageRef.current.scaledHeight;
        const presentationAreaAspectRatio = presentationAreaWidth / adjustedPresentationAreaHeight;

        let initialZoom;

        if (slideAspectRatio > presentationAreaAspectRatio
          || (fitToWidthRef.current && isPresenter)
        ) {
          initialZoom = presentationAreaWidth / currentPresentationPageRef.current.scaledWidth;
        } else {
          initialZoom = adjustedPresentationAreaHeight
            / currentPresentationPageRef.current.scaledHeight;
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
    presentationWidth,
    presentationHeight,
    isPresenter,
    presentationId,
    fitToWidthRef.current,
  ]);

  React.useEffect(() => {
    if (fitToWidthRef.current && isPresenterRef.current) {
      // when presentationHeight changes and we are using fitToWidht
      // the zoom level and camera position stays same
      // so we have to send the updated viewed area to server manually
      const handleHeightChanged = () => {
        const viewedRegionW = SlideCalcUtil.calcViewedRegionWidth(
          tlEditorRef.current?.getViewportPageBounds()?.w,
          currentPresentationPageRef.current?.scaledWidth,
        );
        const viewedRegionH = SlideCalcUtil.calcViewedRegionHeight(
          tlEditorRef.current?.getViewportPageBounds()?.h,
          currentPresentationPageRef.current?.scaledHeight,
        );

        const camera = tlEditorRef.current.getCamera();

        zoomSlide(
          viewedRegionW, viewedRegionH, camera.x, camera.y,
          currentPresentationPageRef.current,
        );
      };
      const timeoutId = setTimeout(handleHeightChanged, CAMERA_UPDATE_DELAY);
      return () => clearTimeout(timeoutId);
    }
    return () => null;
  }, [
    presentationHeight,
    fitToWidthRef.current,
    isPresenterRef.current,
  ]);

  React.useEffect(() => {
    const handleResize = () => {
      if (!initialViewBoxWidthRef.current) {
        initialViewBoxWidthRef.current = currentPresentationPageRef.current?.scaledViewBoxWidth;
      }
      if (!initialViewBoxHeightRef.current) {
        initialViewBoxHeightRef.current = currentPresentationPageRef.current?.scaledViewBoxHeight;
      }

      if (
        presentationAreaHeight > 0 &&
        presentationAreaWidth > 0 &&
        tlEditor &&
        currentPresentationPage &&
        currentPresentationPage.scaledWidth > 0 &&
        currentPresentationPage.scaledHeight > 0
      ) {
        const currentZoom = zoomValueRef.current || HUNDRED_PERCENT;
        const baseZoom = calculateZoomValue(
          currentPresentationPageRef.current.scaledWidth,
          currentPresentationPageRef.current.scaledHeight
        );
        let adjustedZoom = (baseZoom * currentZoom) / HUNDRED_PERCENT;

        if (isPresenter) {
          const container = document.querySelector('[data-test="presentationContainer"]');
          const innerWrapper = document.getElementById('presentationInnerWrapper');
          const containerWidth = container ? container.offsetWidth : 0;
          const innerWrapperWidth = innerWrapper ? innerWrapper.offsetWidth : 0;
          const widthGap = Math.max(containerWidth - innerWrapperWidth, 0);
          const camera = tlEditorRef.current.getCamera();

          if (widthGap > 0) {
            adjustedZoom = calculateZoomWithGapValue(
              currentPresentationPageRef.current.scaledWidth,
              currentPresentationPageRef.current.scaledHeight,
              widthGap
            );

            adjustedZoom *= currentZoom / HUNDRED_PERCENT;
          } else {
            adjustedZoom = (baseZoom * currentZoom) / HUNDRED_PERCENT;
          }

          const zoomToApply =
            widthGap > 0 ? adjustedZoom : (baseZoom * currentZoom) / HUNDRED_PERCENT;

          const formattedPageId = Number(curPageIdRef?.current);

          const updatedCurrentCam = {
            ...camera,
            z: adjustedZoom,
          };

          let cameras = [
            createCamera(formattedPageId - 1, zoomToApply),
            updatedCurrentCam,
            createCamera(formattedPageId + 1, zoomToApply),
          ];
          cameras = cameras.filter((cam) => cam.id !== 'camera:page:0');
          tlEditorRef.current.store.put(cameras);
        } else {
          // Viewer logic
          const newZoom = calculateZoomValue(
            currentPresentationPage.scaledViewBoxWidth,
            currentPresentationPage.scaledViewBoxHeight
          );

          const camera = tlEditorRef.current.getCamera();
          const formattedPageId = Number(curPageIdRef?.current);
          const updatedCurrentCam = {
            ...camera,
            z: newZoom,
          };

          let cameras = [
            createCamera(formattedPageId - 1, newZoom),
            updatedCurrentCam,
            createCamera(formattedPageId + 1, newZoom),
          ];
          cameras = cameras.filter((cam) => cam.id !== 'camera:page:0');
          tlEditorRef.current.store.put(cameras);
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
      const newZoom = calculateZoomValue(
        currentPresentationPage.scaledViewBoxWidth,
        currentPresentationPage.scaledViewBoxHeight,
      );

      const adjustedXPos = currentPresentationPage.xOffset;
      const adjustedYPos = currentPresentationPage.yOffset;

      setCamera(
        newZoom,
        adjustedXPos,
        adjustedYPos,
      );
    }
  }, [currentPresentationPage, isPresenter]);

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

  const createPage = (currentPageId) => [
    {
      meta: {},
      id: currentPageId,
      name: `Slide ${currentPageId?.split(':')[1]}`,
      index: 'a1',
      typeName: 'page',
    },
  ];

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
  };

  const cleanupStore = (currentPageId) => {
    const allRecords = tlEditorRef.current.store.allRecords();
    const shapeIdsToRemove = allRecords
      .filter((record) => record.typeName === 'shape' && record.parentId && record.parentId !== currentPageId)
      .map((shape) => shape.id);

    if (shapeIdsToRemove.length > 0) {
      tlEditorRef.current.deleteShapes(shapeIdsToRemove);
    }
  };

  const updateStore = (pages, cameras) => {
    tlEditorRef.current.store.put(pages);
    tlEditorRef.current.store.put(cameras);
    tlEditorRef.current.store.put(assets);
    tlEditorRef.current.store.put(bgShape);
  };

  const finalizeStore = () => {
    tlEditorRef.current.history.clear();
  };

  const toggleToolbarIfNeeded = () => {
    if (whiteboardToolbarAutoHide && toggleToolsAnimations) {
      toggleToolsAnimations('fade-in', 'fade-out', '0s', hasWBAccessRef.current || isPresenterRef.current);
    }
  };

  const resetSlideState = () => {
    slideChanged.current = false;
    slideNext.current = null;
  };

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

  React.useEffect(() => {
    setTldrawIsMounting(true);
    return () => {
      isMountedRef.current = false;
      localStorage.removeItem('initialViewBoxWidth');
      localStorage.removeItem('initialViewBoxHeight');
      if (mountedTimeoutIdRef.current) {
        clearTimeout(mountedTimeoutIdRef.current);
      }
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
    const actionsElement = document.querySelector('[data-testid="main.action-menu"]');

    if (bbbMultiUserTools.length >= 1 && !isModerator) {
      allElements.forEach((element) => {
        const toolName = element.getAttribute('data-testid').split('.')[1];

        if (!bbbMultiUserTools.includes(toolName)) {
          // eslint-disable-next-line no-param-reassign
          element.style.display = 'none';
        }
      });

      if (actionsElement) {
        if (!bbbMultiUserTools.includes('actions')) {
          actionsElement.style.display = 'none';
        }
      }
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
    const actionsElement = document.querySelector('[data-testid="main.action-menu"]');

    if (bbbPresenterTools.length >= 1 && isPresenter) {
      allElements.forEach((element) => {
        const toolName = element.getAttribute('data-testid').split('.')[1];

        if (!bbbPresenterTools.includes(toolName)) {
          // eslint-disable-next-line no-param-reassign
          element.style.display = 'none';
        }
      });

      if (actionsElement) {
        if (!bbbPresenterTools.includes('actions')) {
          actionsElement.style.display = 'none';
        }
      }
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
    const actionsElement = document.querySelector('[data-testid="main.action-menu"]');

    if (bbbMultiUserPenOnly && !isModerator && !isPresenter) {
      allElements.forEach((element) => {
        const toolName = element.getAttribute('data-testid').split('.')[1];

        const displayStyle = toolName !== 'draw' ? 'none' : 'flex';
        // eslint-disable-next-line no-param-reassign
        element.style.display = displayStyle;
      });

      if (actionsElement) {
        actionsElement.style.display = 'none';
      }
    }
  // TODO: we should add the dependency  list in [] parameter here
  // so this is not run on every render
  });

  if (!isTabVisible) {
    return null;
  }

  return (
    <div
      ref={whiteboardRef}
      id="whiteboard-element"
      key={`animations=-${animations}-${whiteboardToolbarAutoHide}-${language}-${presentationId}`}
    >
      <Tldraw
        autoFocus={false}
        key={`tldrawv2-${presentationId}-${animations}`}
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
  isPhone: PropTypes.bool,
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
  presentationWidth: PropTypes.number.isRequired,
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
