import * as React from "react";
import PropTypes from "prop-types";
import { useEffect, useRef, useCallback } from "react";
import { debounce, isEqual } from "radash";
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
} from "@bigbluebutton/tldraw";
import "@bigbluebutton/tldraw/tldraw.css";
import { compressToBase64, decompressFromBase64 } from 'lz-string';
import SlideCalcUtil from "/imports/utils/slideCalcUtils";
import { HUNDRED_PERCENT } from "/imports/utils/slideCalcUtils";
// eslint-disable-next-line import/no-extraneous-dependencies
import Settings from '/imports/ui/services/settings';
import meetingClientSettingsInitialValues from '/imports/ui/core/initial-values/meetingClientSettings';
import getFromUserSettings from '/imports/ui/services/users-settings';
import KEY_CODES from "/imports/utils/keyCodes";
import Styled from "./styles";
import {
  mapLanguage,
  isValidShapeType,
} from "./utils";
import { useMouseEvents, useCursor } from "./hooks";
import { notifyShapeNumberExceeded, getCustomEditorAssetUrls, getCustomAssetUrls } from "./service";

import NoopTool from './custom-tools/noop-tool/component';

import { PollShapeUtil } from './custom-shapes/poll/component';

const CAMERA_TYPE = "camera";

// Helper functions
const deleteLocalStorageItemsWithPrefix = (prefix) => {
  const keysToRemove = Object.keys(localStorage).filter((key) =>
    key.startsWith(prefix)
  );
  keysToRemove.forEach((key) => localStorage.removeItem(key));
};

// Example of typical LocalStorage entry tldraw creates:
// `{ TLDRAW_USER_DATA_v3: '{"version":2,"user":{"id":"epDk1 ...`
const clearTldrawCache = () => {
  deleteLocalStorageItemsWithPrefix("TLDRAW");
};

const calculateEffectiveZoom = (initViewboxWidth, curViewboxWidth, initViewboxHeight, curViewboxHeight) => {
  // Calculate the effective zoom level based on the change in viewBox dimensions
  const widthZoomValue = (initViewboxWidth * 100) / curViewboxWidth;
  const heightZoomValue = (initViewboxHeight * 100) / curViewboxHeight;
  
  // Take the smaller zoom value to ensure the entire content fits in the viewbox
  const effectiveZoomValue = Math.min(widthZoomValue, heightZoomValue);
  return effectiveZoomValue;
};

const determineViewerFitToWidth = (currentPresentationPage) => {
  return (
    currentPresentationPage?.scaledViewBoxWidth ===
      currentPresentationPage?.scaledWidth &&
    currentPresentationPage?.scaledViewBoxHeight !==
      currentPresentationPage?.scaledHeight
  );
};

const createCamera = (pageId, zoomLevel) => ({
  id: `camera:page:${pageId}`,
  meta: {},
  typeName: CAMERA_TYPE,
  x: 0,
  y: 0,
  z: zoomLevel,
});

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

const defaultUser = {
  userId: '',
};

const Whiteboard = React.memo(function Whiteboard(props) {
  const {
    isPresenter = false,
    removeShapes,
    persistShapeWrapper,
    shapes,
    assets,
    currentUser = defaultUser,
    whiteboardId = undefined,
    zoomSlide,
    curPageId,
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
    presentationWidth,
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
  const [initialViewBoxWidth, setInitialViewBoxWidth] = React.useState(null);
  const [initialViewBoxHeight, setInitialViewBoxHeight] = React.useState(null);

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

  const THRESHOLD = 0.1;
  const CAMERA_UPDATE_DELAY = 650;
  const lastKnownHeight = React.useRef(presentationAreaHeight);
  const lastKnownWidth = React.useRef(presentationAreaWidth);

  const [shapesVersion, setShapesVersion] = React.useState(0);

  const customShapeUtils = [PollShapeUtil];
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

  React.useEffect(() => {
    if (whiteboardRef.current) {
      whiteboardRef.current.addEventListener("keydown", handleKeyDown, {
        capture: true,
      });
    }

    return () => {
      whiteboardRef.current?.removeEventListener("keydown", handleKeyDown);
    };
  }, [whiteboardRef.current]);

  const language = React.useMemo(() => {
    return mapLanguage(locale?.toLowerCase() || "en");
  }, [locale]);

  const [cursorPosition, updateCursorPosition] = useCursor(
    publishCursorUpdate,
    whiteboardIdRef.current
  );

  const pasteTldrawContent = (editor, clipboard, point) => {
    const p = point ?? (editor.inputs.shiftKey ? editor.inputs.currentPagePoint : undefined);
    editor.mark('paste');
    editor.putContentOntoCurrentPage(clipboard, {
      point: p,
      select: true,
    });
  };

  const handleCut = useCallback((shouldCopy) => {
    const selectedShapes = tlEditorRef.current?.getSelectedShapes();
    if (!selectedShapes || selectedShapes.length === 0) {
      return;
    }
    if (shouldCopy) {
      handleCopy();
    }
    tlEditorRef.current?.deleteShapes(selectedShapes.map(shape => shape.id));
  }, [tlEditorRef]);

  const handleCopy = useCallback(() => {
    const selectedShapes = tlEditorRef.current?.getSelectedShapes();
    if (!selectedShapes || selectedShapes.length === 0) {
      return;
    }
    const content = tlEditorRef.current?.getContentFromCurrentPage(selectedShapes.map(shape => shape.id));
    if (content) {
      clipboardContent = content;
      const stringifiedClipboard = compressToBase64(
        JSON.stringify({
          type: 'application/tldraw',
          kind: 'content',
          data: content,
        })
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
        }).catch((error) => {
          isPasting = false;
        });
      }
    }, 100);
  }, [tlEditorRef]);

  const handleKeyDown = useCallback((event) => {
    const debouncedUndo = debounce({ delay: 150 }, () => {
      tlEditorRef.current?.undo();
    });

    if (event.key === 'Escape' || event.keyCode === 27) {
      tlEditorRef.current?.deselect(...tlEditorRef.current?.getSelectedShapes());
      return;
    }

    const editingShape = tlEditorRef.current?.getEditingShape();
    if (editingShape && (isPresenterRef.current || hasWBAccessRef.current)) {
      return;
    }

    if (event.key === 'Delete') {
      handleCut(false);
      return;
    }

    if (event.key === ' ' && tlEditorRef.current?.getCurrentToolId() !== 'hand' && isPresenterRef.current) {
      previousTool.current = tlEditorRef.current?.getCurrentToolId();
      tlEditorRef.current?.setCurrentTool("hand");
      return;
    }

    // Mapping of simple key shortcuts to tldraw functions
    const simpleKeyMap = {
      'v': () => tlEditorRef.current?.setCurrentTool("select"),
      'd': () => tlEditorRef.current?.setCurrentTool("draw"),
      'e': () => tlEditorRef.current?.setCurrentTool("eraser"),
      'h': () => tlEditorRef.current?.setCurrentTool("hand"),
      'r': () => tlEditorRef.current?.setCurrentTool("rectangle"),
      'o': () => tlEditorRef.current?.setCurrentTool("ellipse"),
      'a': () => tlEditorRef.current?.setCurrentTool("arrow"),
      'l': () => tlEditorRef.current?.setCurrentTool("line"),
      't': () => tlEditorRef.current?.setCurrentTool("text"),
      'f': () => tlEditorRef.current?.setCurrentTool("frame"),
      'n': () => tlEditorRef.current?.setCurrentTool("note"),
    };

    if (event.ctrlKey || event.metaKey) {
      const ctrlKeyMap = {
        'a': () => {
          tlEditorRef.current?.selectAll();
          tlEditorRef.current?.setCurrentTool("select");
        },
        'd': () => {
          tlEditorRef.current?.duplicateShapes(tlEditorRef.current?.getSelectedShapes(), { x: 35, y: 35 });
          tlEditorRef.current?.selectNone();
        },
        'x': () => {
          handleCut(true);
        },
        'c': () => {
          handleCopy();
        },
        'v': () => {
          if (!isPasting) {
            handlePaste();
          }
        },
        'z': debouncedUndo,
      };
      if (ctrlKeyMap[event.key]) {
        event.preventDefault();
        event.stopPropagation();
        ctrlKeyMap[event.key]();
        return;
      }
    }

    if (simpleKeyMap[event.key]) {
      event.preventDefault();
      event.stopPropagation();
      simpleKeyMap[event.key]();
      return;
    }

    const moveDistance = 10;
    const selectedShapes = tlEditorRef.current?.getSelectedShapes().map(shape => shape.id);

    const arrowKeyMap = {
      'ArrowUp': { x: 0, y: -moveDistance },
      'ArrowDown': { x: 0, y: moveDistance },
      'ArrowLeft': { x: -moveDistance, y: 0 },
      'ArrowRight': { x: moveDistance, y: 0 },
    };

    if (arrowKeyMap[event.key]) {
      event.preventDefault();
      event.stopPropagation();
      tlEditorRef.current?.nudgeShapes(selectedShapes, arrowKeyMap[event.key], { squashing: true });
    }
  }, [tlEditorRef, isPresenterRef, hasWBAccessRef, previousTool, handleCut, handleCopy, handlePaste]);

  const handleTldrawMount = (editor) => {
    setTlEditor(editor);
    setTldrawAPI(editor);

    editor?.user?.updateUserPreferences({ locale: language });

    const debouncePersistShape = debounce({ delay: 0 }, persistShapeWrapper);

    const colorStyles = [
      "black",
      "blue",
      "green",
      "grey",
      "light-blue",
      "light-green",
      "light-red",
      "light-violet",
      "orange",
      "red",
      "violet",
      "yellow",
    ];
    const dashStyles = ["dashed", "dotted", "draw", "solid"];
    const fillStyles = ["none", "pattern", "semi", "solid"];
    const fontStyles = ["draw", "mono", "sans", "serif"];
    const sizeStyles = ["l", "m", "s", "xl"];

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
        const shapeNumberExceeded = Object.keys(prevShapesRef.current).length + addedCount > maxNumberOfAnnotations;
        const invalidShapeType = Object.keys(added).find((id) => !isValidShapeType(added[id]));

        if (shapeNumberExceeded || invalidShapeType) {
          // notify and undo last command without persisting to not generate the onUndo/onRedo callback
          if (shapeNumberExceeded) {
            notifyShapeNumberExceeded(intl, maxNumberOfAnnotations);
          } else {
            notifyNotAllowedChange(intl);
          }
          editor.history.undo({ persist: false });
        } else {
          Object.values(added).forEach((record) => {
            const updatedRecord = {
              ...record,
              meta: {
                ...record.meta,
                createdBy: currentUser?.userId,
              },
            };

            persistShapeWrapper(
              updatedRecord,
              whiteboardIdRef.current,
              isModeratorRef.current
            );
          });
        }

        Object.values(updated).forEach(([_, record]) => {
          const createdBy =
            prevShapesRef.current[record?.id]?.meta?.createdBy ||
            currentUser?.userId;
          const updatedRecord = {
            ...record,
            meta: {
              createdBy,
              updatedBy: currentUser?.userId,
            },
          };

          persistShapeWrapper(
            updatedRecord,
            whiteboardIdRef.current,
            isModeratorRef.current
          );
        });

        Object.values(removed).forEach((record) => {
          removeShapes([record?.id]);
        });
      },
      { source: "user", scope: "document" }
    );

    editor.store.listen(
      (entry) => {
        const { changes, source } = entry;
        const { updated } = changes;
        const { "pointer:pointer": pointers } = updated;

        if ((isPresenterRef.current || hasWBAccessRef.current) && pointers) {
          const [prevPointer, nextPointer] = pointers;
          updateCursorPosition(nextPointer?.x, nextPointer?.y);
        }

        const camKey = `camera:page:${curPageIdRef.current}`;
        const { [camKey]: cameras } = updated;

        if (cameras) {
          const [prevCam, nextCam] = cameras;
          const panned = prevCam.x !== nextCam.x || prevCam.y !== nextCam.y;

          if (panned && isPresenterRef.current) {
            let viewedRegionW = SlideCalcUtil.calcViewedRegionWidth(
              editor?.getViewportPageBounds()?.w,
              currentPresentationPageRef.current?.scaledWidth
            );
            let viewedRegionH = SlideCalcUtil.calcViewedRegionHeight(
              editor?.getViewportPageBounds()?.h,
              currentPresentationPageRef.current?.scaledHeight
            );

            zoomSlide(viewedRegionW, viewedRegionH, nextCam.x, nextCam.y, currentPresentationPageRef.current);
          }
        }
      },
      { source: "user" }
    );

    if (editor && curPageIdRef.current) {
      const pages = [
        {
          meta: {},
          id: `page:${curPageIdRef.current}`,
          name: `Slide ${curPageIdRef.current}`,
          index: `a1`,
          typeName: "page",
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
      const filteredShapes =
        localShapes.filter((item) => item.typeName === "shape") || [];

      const localShapesObj = {};
      filteredShapes.forEach((shape) => {
        localShapesObj[shape.id] = shape;
      });

      const shapesToAdd = [];
      for (let id in remoteShapes) {
        if (
          !localShapesObj[id] ||
          JSON.stringify(remoteShapes[id]) !==
            JSON.stringify(localShapesObj[id])
        ) {
          shapesToAdd.push(remoteShapes[id]);
        }
      }

      editor.store.mergeRemoteChanges(() => {
        if (shapesToAdd && shapesToAdd.length) {
          shapesToAdd.forEach((shape) => {
            delete shape.isModerator;
            delete shape.questionType;
          });
          editor.store.put(shapesToAdd);
        }
      });

      editor.store.onBeforeChange = (prev, next, source) => {
        if (next?.typeName === "instance_page_state") {
          if (isPresenterRef.current || isModeratorRef.current) return next;

          // Filter selectedShapeIds based on shape owner
          if (next.selectedShapeIds.length > 0 && !isEqual(prev.selectedShapeIds, next.selectedShapeIds)) {
            next.selectedShapeIds = next.selectedShapeIds.filter((shapeId) => {
              const shapeOwner = prevShapesRef.current[shapeId]?.meta?.createdBy;
              return !shapeOwner || shapeOwner === currentUser?.userId;
            });
          }

          if (!isEqual(prev.hoveredShapeId, next.hoveredShapeId)) {
            const hoveredShapeOwner = prevShapesRef.current[next.hoveredShapeId]?.meta?.createdBy;
            if (hoveredShapeOwner !== currentUser?.userId) {
              next.hoveredShapeId = null;
            }
          }

          return next;
        }

        // Get viewport dimensions and bounds
        const viewportPageBounds = editor.getViewportPageBounds();
        const { w: viewportWidth, h: viewportHeight } = viewportPageBounds;

        const presentationWidth = currentPresentationPage?.scaledWidth || 0;
        const presentationHeight = currentPresentationPage?.scaledHeight || 0;

        // Adjust camera position to ensure it stays within bounds
        const panned = next?.id?.includes("camera") && (prev.x !== next.x || prev.y !== next.y);
        if (panned && !currentPresentationPageRef.current?.infiniteWhiteboard) {
          // Horizontal bounds check
          if (next.x > 0) {
            next.x = 0;
          } else if (next.x < -(presentationWidth - viewportWidth)) {
            next.x = -(presentationWidth - viewportWidth);
          }

          // Vertical bounds check
          if (next.y > 0) {
            next.y = 0;
          } else if (next.y < -(presentationHeight - viewportHeight)) {
            next.y = -(presentationHeight - viewportHeight);
          }
        }

        return next;
      };

      if (!isPresenterRef.current && !hasWBAccessRef.current) {
        editor.setCurrentTool('noop');
      }
    }

    isMountedRef.current = true;
  };

  const { shapesToAdd, shapesToUpdate, shapesToRemove } = React.useMemo(() => {
    const localShapes = tlEditorRef.current?.getCurrentPageShapes();
    const filteredShapes =
      localShapes?.filter((item) => item?.index !== "a0") || [];
    const localLookup = new Map(
      filteredShapes.map((shape) => [shape.id, shape])
    );
    const remoteShapeIds = Object.keys(prevShapesRef.current);
    const toAdd = [];
    const toUpdate = [];
    const toRemove = [];

    Object.values(prevShapesRef.current).forEach((remoteShape) => {
      if (!remoteShape.id) return;
      const localShape = localLookup.get(remoteShape.id);
      const prevShape = prevShapesRef.current[remoteShape.id];

      if (!localShape) {
        delete remoteShape.isModerator;
        delete remoteShape.questionType;
        toAdd.push(remoteShape);
      } else {
        const remoteShapeMeta = remoteShape?.meta;
        const isCreatedByCurrentUser = remoteShapeMeta?.createdBy === currentUser?.userId;
        const isUpdatedByCurrentUser = remoteShapeMeta?.updatedBy === currentUser?.userId;

        // System-level shapes (background image) lack createdBy and updatedBy metadata, which can cause false positives.
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

    filteredShapes.forEach((localShape) => {
      if (!remoteShapeIds.includes(localShape.id)) {
        toRemove.push(localShape.id);
      }
    });

    return {
      shapesToAdd: toAdd,
      shapesToUpdate: toUpdate,
      shapesToRemove: toRemove,
    };
  }, [prevShapesRef.current, curPageId]);

  const setCamera = (zoom, x = 0, y = 0) => {
    if (tlEditorRef.current) {
      tlEditorRef.current.setCamera({ x, y, z: zoom }, false);
    }
  };

  const calculateZoomValue = (localWidth, localHeight, isViewer = false) => {
    let calcedZoom;

    calcedZoom = fitToWidth
      ? presentationAreaWidth / localWidth
      : Math.min(
          presentationAreaWidth / localWidth,
          presentationAreaHeight / localHeight
        );

    return calcedZoom === 0 || calcedZoom === Infinity
      ? HUNDRED_PERCENT
      : calcedZoom;
  };

  const calculateZoomWithGapValue = (
    localWidth,
    localHeight,
    isViewer = false,
    widthAdjustment = 0
  ) => {
    let presentationWidth = presentationAreaWidth - widthAdjustment;
    let calcedZoom = (baseZoom = fitToWidth
      ? presentationWidth / localWidth
      : Math.min(
          presentationWidth / localWidth,
          presentationAreaHeight / localHeight
        ));
    return calcedZoom === 0 || calcedZoom === Infinity
      ? HUNDRED_PERCENT
      : calcedZoom;
  };

  useMouseEvents(
    { whiteboardRef, tlEditorRef, isWheelZoomRef, initialZoomRef },
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
    }
  );

  React.useEffect(() => {
    tlEditorRef.current = tlEditor;
  }, [tlEditor]);

  React.useEffect(() => {
    let undoRedoIntervalId = null;

    const undo = () => {
      tlEditorRef?.current?.history?.undo();
    };

    const redo = () => {
      tlEditorRef?.current?.history?.redo();
    };

    const handleArrowPress = (event) => {
      const currPageNum = parseInt(curPageIdRef.current);
      const shapeSelected = tlEditorRef.current.getSelectedShapes()?.length > 0;
      const changeSlide = (direction) => {
        if (!currentPresentationPage) return;
        let newSlideNum = currPageNum + direction;
        const outOfBounds =
          direction > 0
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

    const handleUndoRedoOnCondition = (condition, action) => {
      if (condition) {
        action();
      }
    };

    const handleKeyDown = (event) => {
      const isUndo =
        (event.ctrlKey || event.metaKey) && event.key === "z" && !event.shiftKey;
      const isRedo =
        (event.ctrlKey || event.metaKey) && event.shiftKey && event.key === "Z";

      if (
        (isUndo || isRedo) &&
        (isPresenterRef.current || hasWBAccessRef.current)
      ) {
        event.preventDefault();
        event.stopPropagation();

        if (!undoRedoIntervalId) {
          undoRedoIntervalId = setInterval(() => {
            handleUndoRedoOnCondition(isUndo, undo);
            handleUndoRedoOnCondition(isRedo, redo);
          }, 300);
        }
      }

      if (
        (event.keyCode === KEY_CODES.ARROW_RIGHT ||
          event.keyCode === KEY_CODES.ARROW_LEFT) &&
        isPresenterRef.current
      ) {
        handleArrowPress(event);
      }
    };

    const handleKeyUp = (event) => {
      if ((event.key === "z" || event.key === "Z") && undoRedoIntervalId) {
        clearInterval(undoRedoIntervalId);
        undoRedoIntervalId = null;
      }

      if (event.key === ' ') {
        if (previousTool.current) {
          tlEditorRef.current?.setCurrentTool(previousTool.current);
          previousTool.current = null;
        }
      }
    };

    whiteboardRef.current?.addEventListener("keydown", handleKeyDown, {
      capture: true,
    });
    whiteboardRef.current?.addEventListener("keyup", handleKeyUp, {
      capture: true,
    });

    return () => {
      whiteboardRef.current?.removeEventListener("keydown", handleKeyDown);
      whiteboardRef.current?.removeEventListener("keyup", handleKeyUp);
      if (undoRedoIntervalId) {
        clearInterval(undoRedoIntervalId);
      }
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
      isWheelZoomRef.current === false
    ) {
      const zoomLevelForReset =
        initialZoomRef.current ||
        calculateZoomValue(
          currentPresentationPage.scaledWidth,
          currentPresentationPage.scaledHeight
        );

      const zoomCamera =
        zoomValue === HUNDRED_PERCENT
          ? zoomLevelForReset
          : (zoomLevelForReset * zoomValue) / HUNDRED_PERCENT;
      const camera = tlEditorRef.current.getCamera();

      const nextCamera = {
        x:
          zoomValue === HUNDRED_PERCENT
            ? 0
            : camera.x +
              ((camera.x + tlEditorRef.current.getViewportPageBounds().w / 2) /
                zoomCamera -
                camera.x),
        y:
          zoomValue === HUNDRED_PERCENT
            ? 0
            : camera.y +
              ((camera.y + tlEditorRef.current.getViewportPageBounds().h / 2) /
                zoomCamera -
                camera.y),
        z: zoomCamera,
      };

      if (
        zoomValue !== prevZoomValueRef.current ||
        zoomValue === HUNDRED_PERCENT
      ) {
        tlEditor.setCamera(nextCamera, false);

        timeoutId = setTimeout(() => {
          if (zoomValue === HUNDRED_PERCENT) {
            zoomChanger(HUNDRED_PERCENT);
            zoomSlide(HUNDRED_PERCENT, HUNDRED_PERCENT, 0, 0);
          } else {
            // Recalculate viewed region width and height for zoomSlide call
            let viewedRegionW = SlideCalcUtil.calcViewedRegionWidth(
              tlEditorRef.current.getViewportPageBounds().w,
              currentPresentationPage.scaledWidth
            );
            let viewedRegionH = SlideCalcUtil.calcViewedRegionHeight(
              tlEditorRef.current.getViewportPageBounds().h,
              currentPresentationPage.scaledHeight
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
        currentPresentationPage.scaledWidth > 0 &&
        currentPresentationPage.scaledHeight > 0
      ) {
        // Subtract the toolbar height from the presentation area height for the presenter
        const adjustedPresentationAreaHeight = isPresenter
          ? presentationAreaHeight - 40
          : presentationAreaHeight;
        const slideAspectRatio =
          currentPresentationPage.scaledWidth /
          currentPresentationPage.scaledHeight;
        const presentationAreaAspectRatio =
          presentationAreaWidth / adjustedPresentationAreaHeight;

        let initialZoom;

        if (slideAspectRatio > presentationAreaAspectRatio) {
          initialZoom =
            presentationAreaWidth / currentPresentationPage.scaledWidth;
        } else {
          initialZoom =
            adjustedPresentationAreaHeight /
            currentPresentationPage.scaledHeight;
        }

        const tldrawZoom = initialZoom;
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
        presentationAreaHeight - lastKnownHeight.current
      );
      const widthDifference = Math.abs(
        presentationAreaWidth - lastKnownWidth.current
      );

      // Check if the difference is greater than the threshold
      if (heightDifference > THRESHOLD || widthDifference > THRESHOLD) {
        // Update the last known dimensions
        lastKnownHeight.current = presentationAreaHeight;
        lastKnownWidth.current = presentationAreaWidth;

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
            currentPresentationPage.scaledWidth,
            currentPresentationPage.scaledHeight
          );
          let adjustedZoom = baseZoom * (currentZoom / HUNDRED_PERCENT);
          if (isPresenter) {
            const container = document.querySelector(
              '[data-test="presentationContainer"]'
            );
            const innerWrapper = document.getElementById(
              "presentationInnerWrapper"
            );
            const containerWidth = container ? container.offsetWidth : 0;
            const innerWrapperWidth = innerWrapper
              ? innerWrapper.offsetWidth
              : 0;
            const widthGap = Math.max(containerWidth - innerWrapperWidth, 0);
            const camera = tlEditorRef.current.getCamera();

            let adjustedZoom;
            if (widthGap > 0) {
              adjustedZoom = calculateZoomWithGapValue(
                currentPresentationPage.scaledWidth,
                currentPresentationPage.scaledHeight,
                false,
                widthGap
              );

              adjustedZoom *= currentZoom / HUNDRED_PERCENT;
            } else {
              adjustedZoom = baseZoom * (currentZoom / HUNDRED_PERCENT);
            }

            const zoomToApply =
              widthGap > 0
                ? adjustedZoom
                : baseZoom * (currentZoom / HUNDRED_PERCENT);

            const formattedPageId = Number(curPageIdRef?.current);
            const cameras = [
              createCamera(formattedPageId - 1, zoomToApply),
              createCamera(formattedPageId, zoomToApply),
              createCamera(formattedPageId + 1, zoomToApply),
            ];
            tlEditorRef.current.store.put(cameras);
            setCamera(zoomToApply, camera.x, camera.y);
          } else {
            // Viewer logic
            const effectiveZoom = calculateEffectiveZoom(
              initialViewBoxWidthRef.current,
              currentPresentationPage.scaledViewBoxWidth,
              initialViewBoxHeightRef.current,
              currentPresentationPage.scaledViewBoxHeight
            );
            adjustedZoom = baseZoom * (effectiveZoom / HUNDRED_PERCENT);

            const camera = tlEditorRef.current.getCamera();
            const formattedPageId = Number(curPageIdRef?.current);
            const cameras = [
              createCamera(formattedPageId - 1, adjustedZoom),
              createCamera(formattedPageId, adjustedZoom),
              createCamera(formattedPageId + 1, adjustedZoom),
            ];
            tlEditorRef.current.store.put(cameras);
            setCamera(adjustedZoom, camera.x, camera.y);
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
    if (!isPresenter && tlEditorRef.current && initialViewBoxWidthRef.current && initialViewBoxHeightRef.current && currentPresentationPage) {
      const effectiveZoom = calculateEffectiveZoom(
        initialViewBoxWidthRef.current,
        currentPresentationPage.scaledViewBoxWidth,
        initialViewBoxHeightRef.current,
        currentPresentationPage.scaledViewBoxHeight
      );
  
      let adjustedZoom = calculateZoomValue(
        currentPresentationPage.scaledWidth,
        currentPresentationPage.scaledHeight
      ) * (effectiveZoom / HUNDRED_PERCENT);

      const adjustedXPos = currentPresentationPage.xOffset;
      const adjustedYPos = currentPresentationPage.yOffset;

      setCamera(
        adjustedZoom,
        adjustedXPos,
        adjustedYPos
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
            const updatedShapes = shapesToUpdate.map(shape => {
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
  }, [shapesToAdd, shapesToUpdate, shapesToRemove]);

  // Updating presences in tldraw store based on changes in cursors
  React.useEffect(() => {
    if (tlEditorRef.current) {
      const useElement = document.querySelector(".tl-cursor use");
      if (useElement && !isMultiUserActive && !isPresenter) {
        useElement.setAttribute("href", "#redPointer");
      } else if (useElement) {
        useElement.setAttribute("href", "#cursor");
      }

      const idsToRemove = [];

      // Get all presence records from the store
      const allRecords = tlEditorRef.current.store.allRecords();
      const presenceRecords = allRecords.filter(record => record.id.startsWith('instance_presence:'));

      // Check if any presence records correspond to users not in whiteboardWriters
      presenceRecords.forEach(record => {
        const userId = record.userId.split('instance_presence:')[1];
        const hasAccessToWhiteboard = whiteboardWriters.some(writer => writer.userId === userId);

        if (!hasAccessToWhiteboard) {
          idsToRemove.push(record.id);
        }
      });

      const updatedPresences = otherCursors
        .map(({ userId, user, xPercent, yPercent }) => {
          const { presenter, name } = user;
          const id = InstancePresenceRecordType.createId(userId);
          const active = xPercent !== -1 && yPercent !== -1;
          // if cursor is not active remove it from tldraw store
          if (
            !active ||
            (hideViewersCursor &&
              user.role === "VIEWER" &&
              !currentUser?.presenter) ||
            (!presenter && !isMultiUserActive)
          ) {
            idsToRemove.push(id);
            return null;
          }

          const cursor = {
            x: xPercent,
            y: yPercent,
            type: "default",
            rotation: 0,
          };
          const color = presenter ? "#FF0000" : "#70DB70";
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
        name: `Slide ${curPageIdRef.current}`,
        index: 'a1',
        typeName: 'page',
      },
    ];
  }

  const createCameras = (pageId, tlZ) => {
    return [
      createCamera(pageId - 1, tlZ),
      createCamera(pageId, tlZ),
      createCamera(pageId + 1, tlZ),
    ];
  }

  const cleanupStore = (currentPageId) => {
    const allRecords = tlEditorRef.current.store.allRecords();
    const shapeIdsToRemove = allRecords
      .filter(record => record.typeName === 'shape' && record.parentId !== currentPageId)
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
    if (tlEditorRef.current && curPageIdRef.current !== "0") {
      const currentPageId = `page:${curPageIdRef.current}`;
      const tlZ = tlEditorRef.current.getCamera()?.z;
      const formattedPageId = Number(curPageIdRef?.current);

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
      const currentZoomLevel = currentPresentationPageRef.current.scaledWidth / currentPresentationPageRef.current.scaledViewBoxWidth;
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
        presentationAreaHeight > 0 &&
        presentationAreaWidth > 0 &&
        currentPresentationPageRef.current &&
        currentPresentationPageRef.current.scaledWidth > 0 &&
        currentPresentationPageRef.current.scaledHeight > 0
      ) {
        const adjustedPresentationAreaHeight = isPresenter
          ? presentationAreaHeight - 40
          : presentationAreaHeight;

        let effectiveZoom = calculateEffectiveZoom(
          initialViewBoxWidthRef.current,
          currentPresentationPageRef.current.scaledViewBoxWidth,
          initialViewBoxHeightRef.current,
          currentPresentationPageRef.current.scaledViewBoxHeight
        );

        let baseZoom;
        if (isPresenter) {
          baseZoom = fitToWidth
            ? presentationAreaWidth / currentPresentationPageRef.current.scaledWidth
            : Math.min(
                presentationAreaWidth / currentPresentationPageRef.current.scaledWidth,
                adjustedPresentationAreaHeight / currentPresentationPageRef.current.scaledHeight
              );

          const zoomAdjustmentFactor = currentPresentationPageRef.current.scaledWidth / currentPresentationPageRef.current.scaledViewBoxWidth;
          baseZoom *= zoomAdjustmentFactor;

          const adjustedXPos = currentPresentationPageRef.current.xOffset;
          const adjustedYPos = currentPresentationPageRef.current.yOffset;

          setCamera(baseZoom, adjustedXPos, adjustedYPos);
        } else if (includeViewerLogic) {
          baseZoom = Math.min(
            presentationAreaWidth / currentPresentationPageRef.current.scaledWidth,
            adjustedPresentationAreaHeight / currentPresentationPageRef.current.scaledHeight
          );

          const zoomAdjustmentFactor = currentPresentationPageRef.current.scaledWidth / currentPresentationPageRef.current.scaledViewBoxWidth;
          baseZoom *= zoomAdjustmentFactor;

          const presenterXOffset = currentPresentationPageRef.current.xOffset;
          const presenterYOffset = currentPresentationPageRef.current.yOffset;

          const adjustedXPos = isInfiniteWhiteboard ? presenterXOffset : presenterXOffset * effectiveZoom;
          const adjustedYPos = isInfiniteWhiteboard ? presenterYOffset : presenterYOffset * effectiveZoom;

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

  React.useEffect (() => {
    const bbb_multi_user_tools = getFromUserSettings(
      'bbb_multi_user_tools',
      meetingClientSettingsInitialValues.public.whiteboard.toolbar.multiUserTools,
    );
      const allElements = document.querySelectorAll('[data-testid^="tools."]');

      if (bbb_multi_user_tools.length >= 1 && !isModerator) {
        allElements.forEach((element) => {
          const toolName = element.getAttribute('data-testid').split('.')[1];

          if (!bbb_multi_user_tools.includes(toolName)) {
            element.style.display = 'none';
          }
        });
      }
    }),[]

    React.useEffect (() => {
      const bbb_presenter_tools = getFromUserSettings(
        'bbb_presenter_tools',
        meetingClientSettingsInitialValues.public.whiteboard.toolbar.presenterTools,
      );
        const allElements = document.querySelectorAll('[data-testid^="tools."]');

        if (bbb_presenter_tools.length >= 1 && isPresenter) {
          allElements.forEach((element) => {
            const toolName = element.getAttribute('data-testid').split('.')[1];

            if (!bbb_presenter_tools.includes(toolName)) {
              element.style.display = 'none';
            }
          });
        }
      }),[]

      React.useEffect (() => {
        const bbb_multi_user_pen_only = getFromUserSettings(
          'bbb_multi_user_pen_only',
          false,
        );
          const allElements = document.querySelectorAll('[data-testid^="tools."]');

          if (bbb_multi_user_pen_only && !isModerator && !isPresenter) {
            allElements.forEach((element) => {
              const toolName = element.getAttribute('data-testid').split('.')[1];

              if (toolName != 'draw') {
                element.style.display = 'none';
              } else {
                element.style.display = 'flex';
              }
            });
          }
        }),[]

  return (
    <div
      ref={whiteboardRef}
      id={"whiteboard-element"}
      key={`animations=-${animations}-${whiteboardToolbarAutoHide}-${language}-${presentationId}`}
    >
      <Tldraw
        autoFocus={false}
        key={`tldrawv2-${presentationId}-${animations}-${isInfiniteWhiteboard}`}
        forceMobile={true}
        hideUi={hasWBAccessRef.current || isPresenter ? false : true}
        onMount={handleTldrawMount}
        shapeUtils={customShapeUtils}
        tools={customTools}
      />
      <Styled.TldrawV2GlobalStyle
        {...{
          hasWBAccess: hasWBAccessRef.current,
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
  isIphone: PropTypes.bool.isRequired,
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
  curPageId: PropTypes.string.isRequired,
  presentationWidth: PropTypes.number.isRequired,
  presentationHeight: PropTypes.number.isRequired,
  zoomChanger: PropTypes.func.isRequired,
  isRTL: PropTypes.bool.isRequired,
  fitToWidth: PropTypes.bool.isRequired,
  zoomValue: PropTypes.number.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  maxStickyNoteLength: PropTypes.number.isRequired,
  fontFamily: PropTypes.string.isRequired,
  colorStyle: PropTypes.string.isRequired,
  dashStyle: PropTypes.string.isRequired,
  fillStyle: PropTypes.string.isRequired,
  fontStyle: PropTypes.string.isRequired,
  sizeStyle: PropTypes.string.isRequired,
  presentationAreaHeight: PropTypes.number.isRequired,
  presentationAreaWidth: PropTypes.number.isRequired,
  maxNumberOfAnnotations: PropTypes.number.isRequired,
  notifyShapeNumberExceeded: PropTypes.func.isRequired,
  darkTheme: PropTypes.bool.isRequired,
  setTldrawIsMounting: PropTypes.func.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  fullscreenElementId: PropTypes.string.isRequired,
  isFullscreen: PropTypes.bool.isRequired,
  layoutContextDispatch: PropTypes.func.isRequired,
  fullscreenAction: PropTypes.string.isRequired,
  handleToggleFullScreen: PropTypes.func.isRequired,
  presentationId: PropTypes.string,
};
