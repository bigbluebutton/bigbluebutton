import * as React from "react";
import PropTypes from "prop-types";
import { Tldraw, track, useEditor, DefaultColorStyle, DefaultDashStyle, DefaultFillStyle, DefaultFontStyle, DefaultSizeStyle } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import SlideCalcUtil, {
  HUNDRED_PERCENT,
  MAX_PERCENT,
} from "/imports/utils/slideCalcUtils";
// eslint-disable-next-line import/no-extraneous-dependencies
import Settings from "/imports/ui/services/settings";
import logger from "/imports/startup/client/logger";
import KEY_CODES from "/imports/utils/keyCodes";
import {
  presentationMenuHeight,
  styleMenuOffset,
  styleMenuOffsetSmall,
} from "/imports/ui/stylesheets/styled-components/general";
import Styled from "./styles";
import {
  findRemoved,
  filterInvalidShapes,
  mapLanguage,
  usePrevious,
} from "./utils";
// import { throttle } from "/imports/utils/throttle";
import { isEqual, clone } from "radash";
import { InstancePresenceRecordType } from "@tldraw/tldraw";
import { useRef } from "react";
import { debounce, throttle } from "radash";

import { useMouseEvents, useCursor } from "./hooks";

const SMALL_HEIGHT = 435;
const SMALLEST_DOCK_HEIGHT = 475;
const SMALL_WIDTH = 800;
const SMALLEST_DOCK_WIDTH = 710;
const TOOLBAR_SMALL = 28;
const TOOLBAR_LARGE = 32;
const MOUNTED_RESIZE_DELAY = 1500;

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

const calculateEffectiveZoom = (initViewboxWidth, curViewboxWidth) => {
  // Calculate the effective zoom level based on the change in viewBoxWidth
  const effectiveZoomValue = (initViewboxWidth * 100) / curViewboxWidth;
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

export default Whiteboard = React.memo(function Whiteboard(props) {
  const {
    isPresenter,
    removeShapes,
    initDefaultPages,
    persistShapeWrapper,
    shapes,
    assets,
    currentUser,
    whiteboardId,
    zoomSlide,
    curPageId,
    zoomChanger,
    isMultiUserActive,
    isRTL,
    fitToWidth,
    zoomValue,
    intl,
    svgUri,
    maxStickyNoteLength,
    fontFamily,
    colorStyle,
    dashStyle,
    fillStyle,
    fontStyle,
    sizeStyle,
    presentationAreaHeight,
    presentationAreaWidth,
    maxNumberOfAnnotations,
    notifyShapeNumberExceeded,
    darkTheme,
    setTldrawIsMounting,
    width,
    height,
    tldrawAPI,
    setTldrawAPI,
    whiteboardToolbarAutoHide,
    toggleToolsAnimations,
    isIphone,
    sidebarNavigationWidth,
    animations,
    isToolbarVisible,
    isModerator,
    fullscreenRef,
    fullscreenElementId,
    layoutContextDispatch,
    currentPresentationPage,
    numberOfPages,
    presentationId,
    hasWBAccess,
    bgShape,
    whiteboardWriters,
    publishCursorUpdate,
    otherCursors,
    isShapeOwner,
    ShapeStylesContext,
    hideViewersCursor,
    presentationHeight,
    presentationWidth,
    skipToSlide,
  } = props;

  clearTldrawCache();

  if (!currentPresentationPage) return null;

  const [tlEditor, setTlEditor] = React.useState(null);
  const [zoom, setZoom] = React.useState(HUNDRED_PERCENT);
  const [isMounting, setIsMounting] = React.useState(true);
  const [initialViewBoxWidth, setInitialViewBoxWidth] = React.useState(null);

  const prevFitToWidth = usePrevious(fitToWidth);
  const prevPageId = usePrevious(null);

  const whiteboardRef = React.useRef(null);
  const zoomValueRef = React.useRef(null);
  const prevShapesRef = React.useRef(shapes);
  const prevOtherCursorsRef = useRef(otherCursors);
  const tlEditorRef = React.useRef(tlEditor);
  const slideChanged = React.useRef(false);
  const slideNext = React.useRef(null);
  const prevZoomValueRef = React.useRef(null);
  const initialZoomRef = useRef(null);
  const isFirstZoomActionRef = useRef(true);
  const isMouseDownRef = useRef(false);
  const isMountedRef = useRef(false);
  const isWheelZoomRef = useRef(false);
  const isPresenterRef = useRef(isPresenter);
  const whiteboardIdRef = React.useRef(whiteboardId);
  const curPageIdRef = React.useRef(curPageId);
  const hasWBAccessRef = React.useRef(hasWBAccess);
  const isModeratorRef = React.useRef(isModerator);

  const THRESHOLD = 0.1;
  const lastKnownHeight = React.useRef(presentationAreaHeight);
  const lastKnownWidth = React.useRef(presentationAreaWidth);

  const [shapesVersion, setShapesVersion] = React.useState(0);

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
      tlEditorRef?.current?.setCurrentTool('select');
    }
  }, [hasWBAccess]);

  const language = React.useMemo(() => {
    return mapLanguage(Settings?.application?.locale?.toLowerCase() || "en");
  }, [Settings?.application?.locale]);

  const [cursorPosition, updateCursorPosition] = useCursor(
    publishCursorUpdate,
    whiteboardIdRef.current
  );

  const handleKeyDown = (event) => {
    if (!isPresenterRef.current) {
      if (!hasWBAccessRef.current || (hasWBAccessRef.current && (!tlEditorRef.current.editingShape))) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
    }
  };

  React.useEffect(() => {
    if (!isEqual(isPresenterRef.current, isPresenter)) {
      isPresenterRef.current = isPresenter;
    }
  }, [isPresenter]);

  React.useEffect(() => {
    if (!isEqual(hasWBAccessRef.current, hasWBAccess)) {
      hasWBAccessRef.current = hasWBAccess;
    }
  }, [hasWBAccess]);


  React.useEffect(() => {
    if (!isEqual(prevShapesRef.current, shapes)) {
      prevShapesRef.current = shapes;
      setShapesVersion(v => v + 1);
    }
  }, [shapes]);

  React.useEffect(() => {
    if (!isEqual(prevOtherCursorsRef.current, otherCursors)) {
      prevOtherCursorsRef.current = otherCursors;
    }
  }, [otherCursors]);

  React.useEffect(() => {
    if (whiteboardRef.current) {
      whiteboardRef.current.addEventListener('keydown', handleKeyDown, { capture: true });
    }

    return () => {
      whiteboardRef.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, [whiteboardRef.current]);

  const { shapesToAdd, shapesToUpdate, shapesToRemove } = React.useMemo(() => {
    const selectedShapeIds = tlEditorRef.current?.selectedShapeIds || [];
    const localShapes = tlEditorRef.current?.currentPageShapes;
    const filteredShapes = localShapes?.filter((item) => item?.index !== "a0") || [];
    const localLookup = new Map(filteredShapes.map((shape) => [shape.id, shape]));
    const remoteShapeIds = Object.keys(prevShapesRef.current);
    const toAdd = [];
    const toUpdate = [];
    const toRemove = [];

    filteredShapes.forEach((localShape) => {
      if (!remoteShapeIds.includes(localShape.id)) {
        toRemove.push(localShape.id);
      }
    });

    Object.values(prevShapesRef.current).forEach((remoteShape) => {
      if (!remoteShape.id) return;
      const localShape = localLookup.get(remoteShape.id);
      const prevShape = prevShapesRef.current[remoteShape.id];

      if (!localShape) {
          delete remoteShape.isModerator
          delete remoteShape.questionType
          toAdd.push(remoteShape);
      } else if (!isEqual(localShape, remoteShape) && prevShape) {
        const diff = {
          id: remoteShape.id,
          type: remoteShape.type,
          typeName: remoteShape.typeName,
        };

        if (
          (prevShape?.meta?.updatedBy !== currentUser?.userId && !selectedShapeIds.includes(remoteShape.id)) ||
          (prevShape?.meta?.createdBy === currentUser?.userId) ||
          (prevShape?.meta?.createdBy !== currentUser?.userId && selectedShapeIds.includes(remoteShape.id) && (isPresenter || isModeratorRef.current))
        ) {
          Object.keys(remoteShape).forEach((key) => {
            if (key !== "isModerator" && !isEqual(remoteShape[key], localShape[key])) {
              diff[key] = remoteShape[key];
            }
          });

          if (remoteShape.props) {
            Object.keys(remoteShape.props).forEach((key) => {
              if (!isEqual(remoteShape.props[key], localShape.props[key])) {
                diff.props = diff.props || {};
                diff.props[key] = remoteShape.props[key];
              }
            });
          }

          delete diff.isModerator
          delete diff.questionType
          toUpdate.push(diff);
        }
      }
    });

    return {
      shapesToAdd: toAdd,
      shapesToUpdate: toUpdate,
      shapesToRemove: toRemove,
    };
  }, [prevShapesRef.current, curPageIdRef.current]);

  const setCamera = (zoom, x = 0, y = 0) => {
    if (tlEditorRef.current) {
      tlEditorRef.current.setCamera({ x, y, z: zoom }, false);
    }
  };

  const calculateZoomValue = (localWidth, localHeight, isViewer = false) => {
    let calcedZoom;
    if (isViewer) {
      // Logic originally in calculateViewerZoom
      calcedZoom = fitToWidth
        ? presentationAreaWidth / localWidth
        : Math.min(
            presentationAreaWidth / localWidth,
            presentationAreaHeight / localHeight
          );
    } else {
      // Logic originally in calculateZoom
      calcedZoom = fitToWidth
        ? presentationAreaWidth / localWidth
        : Math.min(
            presentationAreaWidth / localWidth,
            presentationAreaHeight / localHeight
          );
    }

    return calcedZoom === 0 || calcedZoom === Infinity
      ? HUNDRED_PERCENT
      : calcedZoom;
  };

  useMouseEvents(
    { whiteboardRef, tlEditorRef, isWheelZoomRef, initialZoomRef },
    {
      isPresenter,
      hasWBAccess: hasWBAccessRef.current,
      isMouseDownRef,
      whiteboardToolbarAutoHide,
      animations,
      publishCursorUpdate,
      whiteboardId: whiteboardIdRef.current,
      cursorPosition,
      updateCursorPosition,
      toggleToolsAnimations,
      currentPresentationPage,
      zoomChanger,
    }
  );

  // update tlEditor ref
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
      const shapeSelected = tlEditorRef.current.selectedShapes.length > 0;
      const changeSlide = (direction) => {
        let newSlideNum = currPageNum + direction;
        const outOfBounds = direction > 0
          ? newSlideNum > currentPresentationPage?.totalPages
          : newSlideNum < 1;

        if (outOfBounds) return;

        skipToSlide(newSlideNum);
        setZoom(HUNDRED_PERCENT);
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
    }

    const handleUndoRedoOnCondition = (condition, action) => {
      if (condition) {
        action();
      }
    };

    const handleKeyDown = (event) => {
      const undoCondition = event.ctrlKey && event.key === 'z' && !event.shiftKey;
      const redoCondition = event.ctrlKey && event.shiftKey && event.key === 'Z';

      if ((undoCondition || redoCondition) && (isPresenter || hasWBAccessRef.current)) {
        event.preventDefault();
        event.stopPropagation();

        if (!undoRedoIntervalId) {
          undoRedoIntervalId = setInterval(() => {
            handleUndoRedoOnCondition(undoCondition, undo);
            handleUndoRedoOnCondition(redoCondition, redo);
          }, 150);
        }
      }

      if ((event.keyCode === KEY_CODES.ARROW_RIGHT || event.keyCode === KEY_CODES.ARROW_LEFT) && isPresenter) {
        handleArrowPress(event)
      }
    };

    const handleKeyUp = (event) => {
      if ((event.key === 'z' || event.key === 'Z') && undoRedoIntervalId) {
        clearInterval(undoRedoIntervalId);
        undoRedoIntervalId = null;
      }
    };

    whiteboardRef.current?.addEventListener('keydown', handleKeyDown, { capture: true });
    whiteboardRef.current?.addEventListener('keyup', handleKeyUp, { capture: true });

    return () => {
      whiteboardRef.current?.removeEventListener('keydown', handleKeyDown);
      whiteboardRef.current?.removeEventListener('keyup', handleKeyUp);
      if (undoRedoIntervalId) {
        clearInterval(undoRedoIntervalId);
      }
    };
  }, [whiteboardRef.current]);

  React.useEffect(() => {
    zoomValueRef.current = zoomValue;

    if (tlEditor && curPageIdRef.current && currentPresentationPage && isPresenter && isWheelZoomRef.current === false) {
      const zoomFitSlide = calculateZoomValue(
        currentPresentationPage.scaledWidth,
        currentPresentationPage.scaledHeight
      );
      const zoomCamera = (zoomFitSlide * zoomValue) / HUNDRED_PERCENT;

      // Assuming centerX and centerY represent the center of the current view
      const centerX = tlEditor.camera.x + (tlEditor.viewportPageBounds.width / 2) / tlEditor.camera.z;
      const centerY = tlEditor.camera.y + (tlEditor.viewportPageBounds.height / 2) / tlEditor.camera.z;

      // Calculate the new camera position to keep the center in focus after zoom
      const nextCamera = {
        x: centerX + (centerX / zoomCamera - centerX) - (centerX / tlEditor.camera.z - centerX),
        y: centerY + (centerY / zoomCamera - centerY) - (centerY / tlEditor.camera.z - centerY),
        z: zoomCamera,
      };

      // Apply bounds restriction logic
      const { maxX, maxY, minX, minY } = tlEditor.viewportPageBounds;
      const { scaledWidth, scaledHeight } = currentPresentationPage;

      if (maxX > scaledWidth) {
        nextCamera.x += maxX - scaledWidth;
      }
      if (maxY > scaledHeight) {
        nextCamera.y += maxY - scaledHeight;
      }
      if (nextCamera.x > 0 || minX < 0 || zoomValueRef.current === HUNDRED_PERCENT) {
        nextCamera.x = 0;
      }
      if (nextCamera.y > 0 || minY < 0 || zoomValueRef.current === HUNDRED_PERCENT) {
        nextCamera.y = 0;
      }

      if (zoomValue !== prevZoomValueRef.current) {
        tlEditor.setCamera(nextCamera, false);

        // Recalculate viewed region width and height if necessary for zoomSlide call
        let viewedRegionW = SlideCalcUtil.calcViewedRegionWidth(
          tlEditor.viewportPageBounds.width,
          currentPresentationPage.scaledWidth
        );
        let viewedRegionH = SlideCalcUtil.calcViewedRegionHeight(
          tlEditor.viewportPageBounds.height,
          currentPresentationPage.scaledHeight
        );

        zoomSlide(
          viewedRegionW,
          viewedRegionH,
          nextCamera.x,
          nextCamera.y,
        );
      }
    }

    // Update the previous zoom value ref with the current zoom value
    prevZoomValueRef.current = zoomValue;
  }, [zoomValue, tlEditor, curPageIdRef.current, isWheelZoomRef.current]);

  React.useEffect(() => {
    if (
      presentationHeight > 0
      && presentationWidth > 0
      && tlEditorRef.current 
      && currentPresentationPage
      && currentPresentationPage.scaledWidth > 0
      && currentPresentationPage.scaledHeight > 0
    ) {
        const baseZoom = calculateZoomValue(
          currentPresentationPage.scaledWidth,
          currentPresentationPage.scaledHeight
        );

        initialZoomRef.current = baseZoom;
    }
  }, [presentationAreaHeight, presentationHeight, presentationAreaWidth, presentationWidth, tlEditorRef, currentPresentationPage]);

  React.useEffect(() => {
    // Calculate the absolute difference
    const heightDifference = Math.abs(presentationAreaHeight - lastKnownHeight.current);
    const widthDifference = Math.abs(presentationAreaWidth - lastKnownWidth.current);

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
          const camera = tlEditorRef.current.camera;

          if (fitToWidth && currentPresentationPage) {
            const currentAspectRatio =
              Math.round((presentationAreaWidth / presentationAreaHeight) * 100) / 100;
            const previousAspectRatio =
              Math.round(
                (currentPresentationPage.scaledViewBoxWidth /
                  currentPresentationPage.scaledViewBoxHeight) *
                  100
              ) / 100;

            setCamera(adjustedZoom, camera.x, camera.y);

            const viewedRegionH = SlideCalcUtil.calcViewedRegionHeight(
              tlEditorRef.current?.viewportPageBounds.height,
              currentPresentationPage.scaledHeight
            );
            setZoom(HUNDRED_PERCENT);
            zoomChanger(HUNDRED_PERCENT);
            zoomSlide(
              HUNDRED_PERCENT,
              viewedRegionH,
              camera.x,
              camera.y,
              presentationId
            );
          } else {
            setCamera(adjustedZoom, camera.x, camera.y);
          }
        } else {
          // Viewer logic
          const effectiveZoom = calculateEffectiveZoom(
            initialViewBoxWidth,
            currentPresentationPage.scaledViewBoxWidth
          );
          adjustedZoom = baseZoom * (effectiveZoom / HUNDRED_PERCENT);

          const camera = tlEditorRef.current.camera;
          setCamera(adjustedZoom, camera.x, camera.y);
        }
      }
    }
  }, [presentationAreaHeight, presentationAreaWidth, curPageIdRef.current]);

  React.useEffect(() => {
    if (!fitToWidth && isPresenter) {
      setZoom(HUNDRED_PERCENT);
      zoomChanger(HUNDRED_PERCENT);
      zoomSlide(
        HUNDRED_PERCENT,
        HUNDRED_PERCENT,
        0,
        0,
      );
    }
  }, [fitToWidth, isPresenter]);

  React.useEffect(() => {
    if (currentPresentationPage.scaledViewBoxWidth && !initialViewBoxWidth) {
      setInitialViewBoxWidth(currentPresentationPage.scaledViewBoxWidth);
    }

    if (!isPresenter && tlEditorRef.current && initialViewBoxWidth) {
      const viewerFitToWidth = determineViewerFitToWidth(
        currentPresentationPage
      );

      // Calculate the effective zoom based on the change in viewBoxWidth
      const effectiveZoom = calculateEffectiveZoom(
        initialViewBoxWidth,
        currentPresentationPage.scaledViewBoxWidth
      );

      const zoomFitSlide = calculateZoomValue(
        currentPresentationPage.scaledWidth,
        currentPresentationPage.scaledHeight,
        true
      );
      const zoomCamera = (zoomFitSlide * effectiveZoom) / HUNDRED_PERCENT;
      setCamera(
        zoomCamera,
        currentPresentationPage?.xOffset,
        currentPresentationPage?.yOffset
      );
    }
  }, [
    currentPresentationPage?.xOffset,
    currentPresentationPage?.yOffset,
    currentPresentationPage?.scaledViewBoxWidth,
    currentPresentationPage?.scaledViewBoxHeight,
  ]);

  React.useEffect(() => {
    // Check if there are any changes to be made
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
            tlEditor?.updateShapes(shapesToUpdate);
          }
        });
      }, 150);

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

      const updatedPresences = prevOtherCursorsRef.current
        .map(({ userId, user, xPercent, yPercent }) => {
          const { presenter, name } = user;
          const id = InstancePresenceRecordType.createId(userId);
          const active = yPercent !== -1 && yPercent !== -1;
          // if cursor is not active remove it from tldraw store
          if (!active || (hideViewersCursor && user.role === 'VIEWER' && !currentUser?.presenter) || (!presenter && !isMultiUserActive)) {
            tlEditorRef.current?.store.remove([id]);
            return null;
          }

          const currentPageId = tlEditorRef.current?.currentPageId;

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
              currentPageId,
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

      // If there are any updated presences, put them all in the store
      if (updatedPresences.length) {
        tlEditorRef.current?.store.put(updatedPresences);
      }
    }
  }, [prevOtherCursorsRef.current]);

  // set current tldraw page when presentation id updates
  React.useEffect(() => {
    if (tlEditorRef.current && curPageIdRef.current !== "0") {
      const pages = [
        {
          meta: {},
          id: `page:${curPageIdRef.current}`,
          name: `Slide ${curPageIdRef.current}`,
          index: `a1`,
          typeName: "page",
        },
      ];

      tlEditorRef.current.store.mergeRemoteChanges(() => {
        tlEditorRef.current.batch(() => {
          tlEditorRef.current.store.put(pages);
          tlEditorRef.current.deletePage(tlEditorRef.current.currentPageId);
          tlEditorRef.current.setCurrentPage(`page:${curPageIdRef.current}`);
          tlEditorRef.current.store.put(assets);
          tlEditorRef.current.createShapes(bgShape);
          tlEditorRef.current.history.clear();
        });
      });

      whiteboardToolbarAutoHide &&
        toggleToolsAnimations(
          "fade-in",
          "fade-out",
          "0s",
          hasWBAccessRef.current || isPresenter
        );
      slideChanged.current = false;
      slideNext.current = null;
    }
  }, [curPageIdRef.current]);

  React.useEffect(() => {
    setTldrawIsMounting(true);
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  React.useEffect(() => {
    if (isMountedRef.current) {
      setTimeout(() => {
        if (
          presentationAreaHeight > 0 &&
          presentationAreaWidth > 0 &&
          currentPresentationPage &&
          currentPresentationPage?.scaledWidth > 0 &&
          currentPresentationPage?.scaledHeight > 0
        ) {
          let adjustedZoom = HUNDRED_PERCENT;

          if (isPresenter) {
            // Presenter logic
            const currentZoom = zoomValueRef.current || HUNDRED_PERCENT;
            const baseZoom = calculateZoomValue(
              currentPresentationPage?.scaledWidth,
              currentPresentationPage?.scaledHeight
            );

            adjustedZoom = baseZoom * (currentZoom / HUNDRED_PERCENT);
          } else {
            // Viewer logic
            const effectiveZoom = calculateEffectiveZoom(
              initialViewBoxWidth,
              currentPresentationPage?.scaledViewBoxWidth
            );
            const baseZoom = calculateZoomValue(
              currentPresentationPage?.scaledWidth,
              currentPresentationPage?.scaledHeight,
              true
            );
            adjustedZoom = baseZoom * (effectiveZoom / HUNDRED_PERCENT);
          }
          setCamera(adjustedZoom);
        }
      }, 250);
    }
  }, [
    isMountedRef.current,
    presentationId,
    curPageIdRef.current,
    isMultiUserActive,
    isPresenter,
    animations,
  ]);

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
  ]);

  const handleTldrawMount = (editor) => {
    setTlEditor(editor);
    setTldrawAPI(editor);

    editor?.user?.updateUserPreferences({ locale: language });

    const debouncePersistShape = debounce({ delay: 0 }, persistShapeWrapper);

    const colorStyles = ['black', 'blue', 'green', 'grey', 'light-blue', 'light-green', 'light-red', 'light-violet', 'orange', 'red', 'violet', 'yellow'];
    const dashStyles = ['dashed', 'dotted', 'draw', 'solid'];
    const fillStyles = ['none', 'pattern', 'semi', 'solid'];
    const fontStyles = ['draw','mono','sans', 'serif'];
    const sizeStyles = ['l', 'm', 's', 'xl'];

    if ( colorStyles.includes(colorStyle) ) {
      editor.setStyleForNextShapes(DefaultColorStyle, colorStyle);
    }
    if ( dashStyles.includes(dashStyle) ) {
      editor.setStyleForNextShapes(DefaultDashStyle, dashStyle);
    }
    if ( fillStyles.includes(fillStyle) ) {
      editor.setStyleForNextShapes(DefaultFillStyle, fillStyle);
    }
    if ( fontStyles.includes(fontStyle)) {
      editor.setStyleForNextShapes(DefaultFontStyle, fontStyle);
    }
    if ( sizeStyles.includes(sizeStyle) ) {
      editor.setStyleForNextShapes(DefaultSizeStyle, sizeStyle);
    }

    editor.store.listen(
      (entry) => {
        const { changes } = entry;
        const { added, updated, removed } = changes;

        Object.values(added).forEach((record) => {
          const updatedRecord = {
            ...record,
            meta: {
              ...record.meta,
              createdBy: currentUser?.userId,
            },
          };
          persistShapeWrapper(updatedRecord, whiteboardIdRef.current, isModeratorRef.current);
        });

        Object.values(updated).forEach(([_, record]) => {
          const createdBy = prevShapesRef.current[record?.id]?.meta?.createdBy || currentUser?.userId;
          const updatedRecord = {
            ...record,
            meta: {
              createdBy,
              updatedBy: currentUser?.userId,
            },
          };
          persistShapeWrapper(updatedRecord, whiteboardIdRef.current, isModeratorRef.current);
        });

        Object.values(removed).forEach((record) => {
          removeShapes([record.id]);
        });
      },
      { source: "user", scope: "document" }
    );

    editor.store.listen(
      (entry) => {
        const { changes, source } = entry;
        const { updated } = changes;
        const { "pointer:pointer": pointers } = updated;
        if (pointers) {
          const [prevPointer, nextPointer] = pointers;
          updateCursorPosition(nextPointer?.x, nextPointer?.y);
        }

        const camKey = `camera:page:${curPageIdRef.current}`;
        const { [camKey]: cameras } = updated;
        if (cameras) {
          const [prevCam, nextCam] = cameras;

          const panned = prevCam.x !== nextCam.x || prevCam.y !== nextCam.y;

          if (panned && isPresenter) {
            let viewedRegionW = SlideCalcUtil.calcViewedRegionWidth(
              editor?.viewportPageBounds.width,
              currentPresentationPage?.scaledWidth
            );
            let viewedRegionH = SlideCalcUtil.calcViewedRegionHeight(
              editor?.viewportPageBounds.height,
              currentPresentationPage?.scaledHeight
            );

            zoomSlide(
              viewedRegionW,
              viewedRegionH,
              nextCam.x,
              nextCam.y,
            );
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
          editor.deletePage(editor.currentPageId);
          editor.setCurrentPage(`page:${curPageIdRef.current}`);
          editor.store.put(assets);
          editor.createShapes(bgShape);
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

          if (isPresenter || isModeratorRef.current) return next;

          // Filter selectedShapeIds based on shape owner
          if (next.selectedShapeIds.length > 0 && !isEqual(prev.selectedShapeIds, next.selectedShapeIds)) {
            next.selectedShapeIds = next.selectedShapeIds.filter(shapeId => {
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

        const camera = editor?.camera;
        const panned =
          next?.id?.includes("camera") &&
          (prev.x !== next.x || prev.y !== next.y);
        const zoomed = next?.id?.includes("camera") && prev.z !== next.z;
        if (panned) {
          // // limit bounds
          if (
            editor?.viewportPageBounds?.maxX >
            currentPresentationPage?.scaledWidth
          ) {
            next.x +=
              editor.viewportPageBounds.maxX -
              currentPresentationPage?.scaledWidth;
          }
          if (
            editor?.viewportPageBounds?.maxY >
            currentPresentationPage?.scaledHeight
          ) {
            next.y +=
              editor.viewportPageBounds.maxY -
              currentPresentationPage?.scaledHeight;
          }
          if (next.x > 0 || editor.viewportPageBounds.minX < 0) {
            next.x = 0;
          }
          if (next.y > 0 || editor.viewportPageBounds.minY < 0) {
            next.y = 0;
          }
        }
        return next;
      };
    }

    isMountedRef.current = true;
  };

  return (
    <div
      ref={whiteboardRef}
      id={"whiteboard-element"}
      key={`animations=-${animations}-${whiteboardToolbarAutoHide}-${language}`}
    >
      <Tldraw
        key={`tldrawv2-${presentationId}-${animations}`}
        forceMobile={true}
        hideUi={hasWBAccessRef.current || isPresenter ? false : true}
        onMount={handleTldrawMount}
      />
      <Styled.TldrawV2GlobalStyle
        {...{ hasWBAccess: hasWBAccessRef.current, isPresenter, isRTL, isMultiUserActive, isToolbarVisible }}
      />
    </div>
  );
});

Whiteboard.propTypes = {
  isPresenter: PropTypes.bool,
  isIphone: PropTypes.bool.isRequired,
  removeShapes: PropTypes.func.isRequired,
  initDefaultPages: PropTypes.func.isRequired,
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
  svgUri: PropTypes.string,
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
  fullscreenRef: PropTypes.instanceOf(Element),
  handleToggleFullScreen: PropTypes.func.isRequired,
  numberOfPages: PropTypes.number,
  sidebarNavigationWidth: PropTypes.number,
  presentationId: PropTypes.string,
};

Whiteboard.defaultProps = {
  fullscreenRef: undefined,
  svgUri: undefined,
  whiteboardId: undefined,
  sidebarNavigationWidth: 0,
  presentationId: undefined,
  currentUser: {
    userId: '',
  },
  isPresenter: false,
  numberOfPages: 0,
};
