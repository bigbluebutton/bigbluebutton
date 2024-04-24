import * as React from "react";
import PropTypes from "prop-types";
import { useRef } from "react";
import { debounce, isEqual } from "radash";
import {
  Tldraw,
  DefaultColorStyle,
  DefaultDashStyle,
  DefaultFillStyle,
  DefaultFontStyle,
  DefaultSizeStyle,
  InstancePresenceRecordType,
} from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import SlideCalcUtil from "/imports/utils/slideCalcUtils";
import { HUNDRED_PERCENT } from "/imports/utils/slideCalcUtils";
// eslint-disable-next-line import/no-extraneous-dependencies
import Settings from "/imports/ui/services/settings";
import KEY_CODES from "/imports/utils/keyCodes";
import Styled from "./styles";
import {
  mapLanguage,
  isValidShapeType,
} from "./utils";
import { useMouseEvents, useCursor } from "./hooks";
import { notifyShapeNumberExceeded } from "./service";

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

const Whiteboard = React.memo(function Whiteboard(props) {
  const {
    isPresenter,
    removeShapes,
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
    presentationId,
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
  } = props;

  clearTldrawCache();

  const [tlEditor, setTlEditor] = React.useState(null);
  const [isMounting, setIsMounting] = React.useState(true);
  const [initialZoomSet, setInitialZoomSet] = React.useState(false);
  const [initialViewBoxWidth, setInitialViewBoxWidth] = React.useState(null);

  const whiteboardRef = React.useRef(null);
  const zoomValueRef = React.useRef(null);
  const prevShapesRef = React.useRef(shapes);
  const prevOtherCursorsRef = useRef(otherCursors);
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

  const THRESHOLD = 0.1;
  const lastKnownHeight = React.useRef(presentationAreaHeight);
  const lastKnownWidth = React.useRef(presentationAreaWidth);

  const [shapesVersion, setShapesVersion] = React.useState(0);

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
      tlEditorRef?.current?.setCurrentTool("select");
    }
  }, [hasWBAccess]);

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
      setShapesVersion((v) => v + 1);
    }
  }, [shapes]);

  React.useEffect(() => {
    if (!isEqual(prevOtherCursorsRef.current, otherCursors)) {
      prevOtherCursorsRef.current = otherCursors;
    }
  }, [otherCursors]);

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
    return mapLanguage(Settings?.application?.locale?.toLowerCase() || "en");
  }, [Settings?.application?.locale]);

  const [cursorPosition, updateCursorPosition] = useCursor(
    publishCursorUpdate,
    whiteboardIdRef.current
  );

  const handleKeyDown = (event) => {
    if (!isPresenterRef.current) {
      if (
        !hasWBAccessRef.current ||
        (hasWBAccessRef.current && !tlEditorRef.current.editingShape)
      ) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
    }
  };

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
              editor?.getViewportPageBounds()?.w,
              currentPresentationPage?.scaledWidth
            );
            let viewedRegionH = SlideCalcUtil.calcViewedRegionHeight(
              editor?.getViewportPageBounds()?.h,
              currentPresentationPage?.scaledHeight
            );

            zoomSlide(viewedRegionW, viewedRegionH, nextCam.x, nextCam.y);
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
          // editor.deletePage(editor.currentPageId);
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
          if (
            next.selectedShapeIds.length > 0 &&
            !isEqual(prev.selectedShapeIds, next.selectedShapeIds)
          ) {
            next.selectedShapeIds = next.selectedShapeIds.filter((shapeId) => {
              const shapeOwner =
                prevShapesRef.current[shapeId]?.meta?.createdBy;
              return !shapeOwner || shapeOwner === currentUser?.userId;
            });
          }

          if (!isEqual(prev.hoveredShapeId, next.hoveredShapeId)) {
            const hoveredShapeOwner =
              prevShapesRef.current[next.hoveredShapeId]?.meta?.createdBy;
            if (hoveredShapeOwner !== currentUser?.userId) {
              next.hoveredShapeId = null;
            }
          }

          return next;
        }

        const camera = editor?.getCamera();
        const { maxX, maxY, minX, minY } = editor.getViewportPageBounds();
        const panned =
          next?.id?.includes("camera") &&
          (prev.x !== next.x || prev.y !== next.y);
        const zoomed = next?.id?.includes("camera") && prev.z !== next.z;
        if (panned) {
          // // limit bounds
          if (maxX > currentPresentationPage?.scaledWidth) {
            next.x += maxX - currentPresentationPage?.scaledWidth;
          }
          if (maxY > currentPresentationPage?.scaledHeight) {
            next.y += maxY - currentPresentationPage?.scaledHeight;
          }
          if (next.x > 0 || minX < 0) {
            next.x = 0;
          }
          if (next.y > 0 || minY < 0) {
            next.y = 0;
          }
        }
        return next;
      };
    }

    isMountedRef.current = true;
  };

  const { shapesToAdd, shapesToUpdate, shapesToRemove } = React.useMemo(() => {
    const selectedShapeIds = tlEditorRef.current?.getSelectedShapeIds() || [];
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
        delete remoteShape.isModerator;
        delete remoteShape.questionType;
        toAdd.push(remoteShape);
      } else if (!isEqual(localShape, remoteShape) && prevShape) {
        const diff = {
          id: remoteShape.id,
          type: remoteShape.type,
          typeName: remoteShape.typeName,
        };

        Object.keys(remoteShape).forEach((key) => {
          if (
            key !== "isModerator" &&
            !isEqual(remoteShape[key], localShape[key])
          ) {
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

        delete diff.isModerator;
        delete diff.questionType;
        toUpdate.push(diff);
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
      const shapeSelected = tlEditorRef.current.selectedShapes.length > 0;
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
      const undoCondition =
        event.ctrlKey && event.key === "z" && !event.shiftKey;
      const redoCondition =
        event.ctrlKey && event.shiftKey && event.key === "Z";

      if (
        (undoCondition || redoCondition) &&
        (isPresenter || hasWBAccessRef.current)
      ) {
        event.preventDefault();
        event.stopPropagation();

        if (!undoRedoIntervalId) {
          undoRedoIntervalId = setInterval(() => {
            handleUndoRedoOnCondition(undoCondition, undo);
            handleUndoRedoOnCondition(redoCondition, redo);
          }, 150);
        }
      }

      if (
        (event.keyCode === KEY_CODES.ARROW_RIGHT ||
          event.keyCode === KEY_CODES.ARROW_LEFT) &&
        isPresenter
      ) {
        handleArrowPress(event);
      }
    };

    const handleKeyUp = (event) => {
      if ((event.key === "z" || event.key === "Z") && undoRedoIntervalId) {
        clearInterval(undoRedoIntervalId);
        undoRedoIntervalId = null;
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
        }, 300);
      }
    }

    // Update the previous zoom value ref with the current zoom value
    prevZoomValueRef.current = zoomValue;
    return () => clearTimeout(timeoutId);
  }, [zoomValue, tlEditor, curPageIdRef.current, isWheelZoomRef.current]);

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
        setInitialZoomSet(true);
        prevZoomValueRef.current = zoomValue;
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [
    currentPresentationPage,
    presentationAreaWidth,
    presentationAreaHeight,
    isPresenter,
  ]);

  React.useEffect(() => {
    const handleResize = () => {
      if (!initialViewBoxWidthRef.current) {
        initialViewBoxWidthRef.current = currentPresentationPageRef.current?.scaledViewBoxWidth;
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
            setTimeout(() => {
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

              setCamera(zoomToApply, camera.x, camera.y);
            }, 50);
          } else {
            // Viewer logic
            const effectiveZoom = calculateEffectiveZoom(
              initialViewBoxWidthRef.current,
              currentPresentationPage.scaledViewBoxWidth
            );
            adjustedZoom = baseZoom * (effectiveZoom / HUNDRED_PERCENT);

            const camera = tlEditorRef.current.getCamera();
            setCamera(adjustedZoom, camera.x, camera.y);
          }
        }
      }
    };

    const timeoutId = setTimeout(handleResize, 300);

    return () => clearTimeout(timeoutId);
  }, [presentationAreaHeight, presentationAreaWidth, curPageIdRef.current]);

  React.useEffect(() => {
    if (!fitToWidth && isPresenter) {
      zoomChanger(HUNDRED_PERCENT);
      zoomSlide(HUNDRED_PERCENT, HUNDRED_PERCENT, 0, 0);
    }
  }, [fitToWidth, isPresenter]);

  React.useEffect(() => {
    if (!isPresenter && tlEditorRef.current && initialViewBoxWidthRef.current && currentPresentationPage) {
      const currentZoomRatio = currentPresentationPage.scaledViewBoxWidth / currentPresentationPage.scaledWidth;
      const initialZoomRatio = initialViewBoxWidthRef.current / currentPresentationPage.scaledWidth;
      const effectiveZoom = initialZoomRatio / currentZoomRatio;

      let adjustedZoom = calculateZoomValue(
        currentPresentationPage.scaledWidth,
        currentPresentationPage.scaledHeight
      ) * effectiveZoom;

      const adjustedXPos = currentPresentationPage.xOffset;
      const adjustedYPos = currentPresentationPage.yOffset;

      setCamera(
        adjustedZoom,
        adjustedXPos,
        adjustedYPos
      );
    }
  }, [currentPresentationPage, initialViewBoxWidthRef.current]);

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
          if (
            !active ||
            (hideViewersCursor &&
              user.role === "VIEWER" &&
              !currentUser?.presenter) ||
            (!presenter && !isMultiUserActive)
          ) {
            tlEditorRef.current?.store.remove([id]);
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
          // tlEditorRef.current.deletePage(tlEditorRef.current.currentPageId);
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
    if (isMountedRef.current) {
      const storedWidth = localStorage.getItem('initialViewBoxWidth');
      if (storedWidth) {
        initialViewBoxWidthRef.current = parseFloat(storedWidth);
      } else {
        const currentZoomLevel = currentPresentationPageRef.current.scaledWidth / currentPresentationPageRef.current.scaledViewBoxWidth;
        const calculatedWidth = currentZoomLevel !== 1
          ? currentPresentationPageRef.current.scaledWidth / currentZoomLevel
          : currentPresentationPageRef.current.scaledWidth;
        initialViewBoxWidthRef.current = calculatedWidth;
        localStorage.setItem('initialViewBoxWidth', calculatedWidth.toString());
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

          let baseZoom;
          if (isPresenter) {
            // For presenters, use the full area minus any UI components like toolbars
            baseZoom = fitToWidth
              ? presentationAreaWidth / currentPresentationPageRef.current.scaledWidth
              : Math.min(
                  presentationAreaWidth / currentPresentationPageRef.current.scaledWidth,
                  adjustedPresentationAreaHeight / currentPresentationPageRef.current.scaledHeight
                );
          } else {
            // For viewers
            const effectiveZoom = calculateEffectiveZoom(
              initialViewBoxWidthRef.current,
              currentPresentationPageRef.current.scaledViewBoxWidth
            );
            baseZoom = calculateZoomValue(
              currentPresentationPageRef.current.scaledWidth,
              currentPresentationPageRef.current.scaledHeight
            ) * effectiveZoom / HUNDRED_PERCENT;
          }

          const zoomAdjustmentFactor = currentPresentationPageRef.current.scaledWidth / currentPresentationPageRef.current.scaledViewBoxWidth;
          baseZoom *= zoomAdjustmentFactor;

          const adjustedXPos = isPresenter
            ? currentPresentationPageRef.current.xOffset : currentPresentationPageRef.current.xOffset * effectiveZoom;
          const adjustedYPos = isPresenter
            ? currentPresentationPageRef.current.yOffset : currentPresentationPageRef.current.yOffset * effectiveZoom;

          setCamera(baseZoom, adjustedXPos, adjustedYPos);
        }
      }, 300);
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
    setTldrawIsMounting(true);
    return () => {
      isMountedRef.current = false;
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
  ]);

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
        {...{
          hasWBAccess: hasWBAccessRef.current,
          isPresenter,
          isRTL,
          isMultiUserActive,
          isToolbarVisible,
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
    userId: "",
  },
  isPresenter: false,
  numberOfPages: 0,
};
