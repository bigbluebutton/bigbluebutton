import * as React from "react";
import PropTypes from "prop-types";
import { Tldraw, track, useEditor } from "@tldraw/tldraw";
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
  sendShapeChanges,
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

// Shallow cloning with nested structures
const deepCloneUsingShallow = (obj) => {
  const clonedObj = clone(obj);
  if (obj.props) {
    clonedObj.props = clone(obj.props);
  }
  if (obj.props) {
    clonedObj.meta = clone(obj.meta);
  }
  return clonedObj;
};

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

const cleanArrowShapeProps = (shapeProp) => {
  if (!shapeProp) return;

  if (shapeProp.type === "binding") {
    delete shapeProp.x;
    delete shapeProp.y;
  }

  if (shapeProp.type === "point") {
    delete shapeProp.boundShapeId;
    delete shapeProp.normalizedAnchor;
    delete shapeProp.isExact;
  }
};

export default Whiteboard = React.memo(function Whiteboard(props) {
  const {
    isPresenter,
    removeShapes,
    initDefaultPages,
    persistShape,
    shapes,
    assets,
    currentUser,
    whiteboardId,
    zoomSlide,
    skipToSlide,
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
    hasShapeAccess,
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
  const prevShapesRef = React.useRef({});
  const tlEditorRef = React.useRef(tlEditor);
  const slideChanged = React.useRef(false);
  const slideNext = React.useRef(null);
  const prevZoomValueRef = React.useRef(null);
  const initialZoomRef = useRef(null);
  const isFirstZoomActionRef = useRef(true);
  const isMouseDownRef = useRef(false);
  const isMountedRef = useRef(false);

  const THRESHOLD = 0.1;
  const lastKnownHeight = React.useRef(presentationAreaHeight);
  const lastKnownWidth = React.useRef(presentationAreaWidth);

    const language = React.useMemo(() => {
    return mapLanguage(Settings?.application?.locale?.toLowerCase() || "en");
  }, [Settings?.application?.locale]);

  const [cursorPosition, updateCursorPosition] = useCursor(publishCursorUpdate, whiteboardId);

  const { shapesToAdd, shapesToUpdate, shapesToRemove } = React.useMemo(() => {
    if (isEqual(prevShapesRef.current, shapes) || isMouseDownRef.current) {
      return { shapesToAdd: [], shapesToUpdate: [], shapesToRemove: [] };
    }

    prevShapesRef.current = shapes;

    const localShapes = tlEditor?.store?.allRecords();
    const filteredShapes =
      localShapes?.filter(
        (item) => item.typeName === "shape" && item?.index !== "a0"
      ) || [];

    const localLookup = new Map(
      filteredShapes.map((shape) => [shape.id, shape])
    );
    const remoteShapeIds = Object.keys(shapes);
    const toAdd = [];
    const toUpdate = [];
    const toRemove = [];

    filteredShapes.forEach((localShape) => {
      // If a local shape does not exist in the remote shapes, it should be removed
      if (!remoteShapeIds.includes(localShape.id)) {
        toRemove.push(localShape);
      }
    });

    Object.values(shapes).forEach((remoteShape) => {
      const localShape = localLookup.get(remoteShape.id);

      // Create a deep clone of remoteShape and remove the isModerator property
      const comparisonRemoteShape = deepCloneUsingShallow(remoteShape);
      delete comparisonRemoteShape.isModerator;
      delete comparisonRemoteShape.questionType;

      if (!localShape) {
        // If the shape does not exist in local, add it to toAdd
        toAdd.push(remoteShape);
      } else if (!isEqual(localShape, comparisonRemoteShape)) {
        // Capture the differences
        const diff = {
          id: remoteShape.id,
          type: remoteShape.type,
          typeName: remoteShape.typeName,
        };

        // Compare each property
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

        if (diff?.type === "arrow") {
          cleanArrowShapeProps(diff?.props?.end);
          cleanArrowShapeProps(diff?.props?.start);
        }
        toUpdate.push(diff);
      }
    });

    toAdd.forEach((shape) => { delete shape.isModerator; delete shape.questionType; });
    toUpdate.forEach((shape) => { delete shape.isModerator; delete shape.questionType; });

    return {
      shapesToAdd: toAdd,
      shapesToUpdate: toUpdate,
      shapesToRemove: toRemove,
    };
  }, [shapes]);

  const setCamera = (zoom, x = 0, y = 0) => {
    if (tlEditorRef.current) {
      tlEditorRef.current.setCamera({ x, y, z: zoom }, false);
    }
  };

  useMouseEvents(
    { whiteboardRef, tlEditorRef },
    {
      isPresenter,
      hasWBAccess,
      isMouseDownRef,
      whiteboardToolbarAutoHide,
      animations,
      publishCursorUpdate,
      whiteboardId,
      cursorPosition,
      updateCursorPosition,
      toggleToolsAnimations,
    }
  );

  // update tlEditor ref
  React.useEffect(() => {
    tlEditorRef.current = tlEditor;
  }, [tlEditor]);

  // presenter effect to handle zoomSlide
  React.useEffect(() => {
    zoomValueRef.current = zoomValue;

    if (tlEditor && curPageId && currentPresentationPage && isPresenter) {
      const zoomFitSlide = calculateZoomValue(
        currentPresentationPage.scaledWidth,
        currentPresentationPage.scaledHeight
      );
      const zoomCamera = (zoomFitSlide * zoomValue) / HUNDRED_PERCENT;

      // Compare the current zoom value with the previous one
      if (zoomValue !== prevZoomValueRef.current) {
        tlEditor?.setCamera(
          {
            z: zoomCamera,
          },
          false
        );

        let viewedRegionW = SlideCalcUtil.calcViewedRegionWidth(
          tlEditor?.viewportPageBounds.width,
          currentPresentationPage.scaledWidth
        );
        let viewedRegionH = SlideCalcUtil.calcViewedRegionHeight(
          tlEditor?.viewportPageBounds.height,
          currentPresentationPage.scaledHeight
        );
        zoomSlide(
          parseInt(curPageId, 10),
          viewedRegionW,
          viewedRegionH,
          tlEditor.camera.x,
          tlEditor.camera.y,
          presentationId
        );
      }
    }

    // Update the previous zoom value ref with the current zoom value
    prevZoomValueRef.current = zoomValue;
  }, [zoomValue, tlEditor, curPageId]);

  React.useEffect(() => {
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
        let adjustedZoom = HUNDRED_PERCENT;

        if (isPresenter) {
          // Presenter logic
          const currentZoom = zoomValueRef.current || HUNDRED_PERCENT;
          const baseZoom = calculateZoomValue(
            currentPresentationPage.scaledWidth,
            currentPresentationPage.scaledHeight
          );

          adjustedZoom = baseZoom * (currentZoom / HUNDRED_PERCENT);

          if (fitToWidth && currentPresentationPage) {
            const currentAspectRatio =
              Math.round(
                (presentationAreaWidth / presentationAreaHeight) * 100
              ) / 100;
            const previousAspectRatio =
              Math.round(
                (currentPresentationPage.scaledViewBoxWidth /
                  currentPresentationPage.scaledViewBoxHeight) *
                  100
              ) / 100;

            if (currentAspectRatio !== previousAspectRatio) {
              setCamera(adjustedZoom);
            } else {
              setCamera(adjustedZoom);
            }

            const viewedRegionH = SlideCalcUtil.calcViewedRegionHeight(
              tlEditorRef.current?.viewportPageBounds.height,
              currentPresentationPage.scaledHeight
            );
            setZoom(HUNDRED_PERCENT);
            zoomChanger(HUNDRED_PERCENT);
            zoomSlide(
              parseInt(curPageId, 10),
              HUNDRED_PERCENT,
              viewedRegionH,
              0,
              0,
              presentationId,
            );
          } else {
            setCamera(adjustedZoom);
          }
        } else {
          // Viewer logic
          const effectiveZoom = calculateEffectiveZoom(
            initialViewBoxWidth,
            currentPresentationPage.scaledViewBoxWidth
          );
          const baseZoom = calculateZoomValue(
            currentPresentationPage.scaledWidth,
            currentPresentationPage.scaledHeight,
            true
          );
          adjustedZoom = baseZoom * (effectiveZoom / HUNDRED_PERCENT);
          setCamera(adjustedZoom);
        }

        if (zoomValueRef.current === HUNDRED_PERCENT) {
          initialZoomRef.current = adjustedZoom;
        }
      }
    }
  }, [presentationAreaHeight, presentationAreaWidth, curPageId]);

  React.useEffect(() => {
    if (!fitToWidth && isPresenter) {
      setZoom(HUNDRED_PERCENT);
      zoomChanger(HUNDRED_PERCENT);
      zoomSlide(
        parseInt(curPageId, 10),
        HUNDRED_PERCENT,
        HUNDRED_PERCENT,
        0,
        0,
        presentationId
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
    if (shapesToAdd.length || shapesToUpdate.length || shapesToRemove.length) {
      tlEditor?.store?.mergeRemoteChanges(() => {
        if (shapesToRemove.length > 0) {
          tlEditor?.store?.remove(shapesToRemove.map((shape) => shape.id));
        }
        if (shapesToAdd.length) {
          tlEditor?.store?.put(shapesToAdd);
        }
        if (shapesToUpdate.length) {
          tlEditor?.updateShapes(shapesToUpdate);
        }
      });
    }
  }, [shapesToAdd, shapesToUpdate, shapesToRemove]);

  // Updating presences in tldraw store based on changes in cursors
  React.useEffect(() => {
    if (tlEditorRef.current) {
      const useElement = document.querySelector(".tl-cursor use");
      if (useElement && !isMultiUserActive) {
        useElement.setAttribute("href", "#redPointer");
      } else if (useElement) {
        useElement.setAttribute("href", "#cursor");
      }

      const updatedPresences = otherCursors
        .map(({ userId, user, xPercent, yPercent }) => {
          const { presenter, name } = user;
          const id = InstancePresenceRecordType.createId(userId);
          const active = yPercent !== -1 && yPercent !== -1;
          // if cursor is not active remove it from tldraw store
          if (!active || (hideViewersCursor && user.role === 'VIEWER' && !currentUser?.presenter)) {
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
  }, [otherCursors]);

  // set current tldraw page when presentation id updates
  React.useEffect(() => {
    if (tlEditor && curPageId !== "0") {
      // Check if the page exists
      const pageExists =
        tlEditorRef.current.currentPageId === `page:${curPageId}`;

      // If the page does not exist, create it
      if (!pageExists) {
        tlEditorRef.current.createPage({ id: `page:${curPageId}` });
      }

      // Set the current page
      tlEditor.setCurrentPage(`page:${curPageId}`);

      whiteboardToolbarAutoHide &&
        toggleToolsAnimations(
          "fade-in",
          "fade-out",
          "0s",
          hasWBAccess || isPresenter
        );
      slideChanged.current = false;
      slideNext.current = null;
    }
  }, [curPageId]);

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
    curPageId,
    isMultiUserActive,
    isPresenter,
    animations
  ]);

  React.useEffect(() => {
    if (isMounting) {
      setIsMounting(false);
      /// brings presentation toolbar back
      setTldrawIsMounting(false);
    }
  }, [tlEditorRef?.current?.camera, presentationAreaWidth, presentationAreaHeight]);

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

  const handleTldrawMount = (editor) => {
    setTlEditor(editor);

    editor?.user?.updateUserPreferences({ locale: language });

    console.log("EDITOR : ", editor);

    const debouncePersistShape = debounce({ delay: 0 }, persistShape);

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
            }
          };
          persistShape(updatedRecord, whiteboardId, isModerator);
        });
    
        Object.values(updated).forEach(([_, record]) => {
          const updatedRecord = {
            ...record,
            meta: {
              updatedBy: currentUser?.userId,
              createdBy: shapes[record?.id]?.meta?.createdBy,
            }
          };
          persistShape(updatedRecord, whiteboardId, isModerator);
        });
    
        Object.values(removed).forEach((record) => {
          removeShapes([record.id], whiteboardId);
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

        const camKey = `camera:page:${curPageId}`;
        const { [camKey]: cameras } = updated;
        if (cameras) {
          const [prevCam, nextCam] = cameras;

          const panned = prevCam.x !== nextCam.x || prevCam.y !== nextCam.y;

          if (panned) {
            let viewedRegionW = SlideCalcUtil.calcViewedRegionWidth(
              editor?.viewportPageBounds.width,
              currentPresentationPage?.scaledWidth
            );
            let viewedRegionH = SlideCalcUtil.calcViewedRegionHeight(
              editor?.viewportPageBounds.height,
              currentPresentationPage?.scaledHeight
            );

            zoomSlide(
              parseInt(curPageId, 10),
              viewedRegionW,
              viewedRegionH,
              nextCam.x,
              nextCam.y,
              presentationId
            );
          }
        }
      },
      { source: "user" }
    );

    if (editor && curPageId) {
      const pages = [
        {
          meta: {},
          id: `page:${curPageId}`,
          name: `Slide ${curPageId}`,
          index: `a1`,
          typeName: "page",
        },
      ];

      editor.store.mergeRemoteChanges(() => {
        editor.batch(() => {
          editor.store.put(pages);
          editor.deletePage(editor.currentPageId);
          editor.setCurrentPage(`page:${curPageId}`);
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
          if (!isEqual(prev.selectedShapeIds, next.selectedShapeIds)) {
            // Filter the selectedShapeIds
            next.selectedShapeIds =
              next.selectedShapeIds.filter(hasShapeAccess);
          }

          return next;
        }

        const camera = editor?.camera;
        const panned =
          next?.id?.includes("camera") &&
          (prev.x !== next.x || prev.y !== next.y);
        const zoomed = next?.id?.includes("camera") && prev.z !== next.z;
        // if (panned && isPresenter) {
        //   // // limit bounds
        //   if (
        //     editor?.viewportPageBounds?.maxX >
        //     currentPresentationPage?.scaledWidth
        //   ) {
        //     next.x +=
        //       editor.viewportPageBounds.maxX -
        //       currentPresentationPage?.scaledWidth;
        //   }
        //   if (
        //     editor?.viewportPageBounds?.maxY >
        //     currentPresentationPage?.scaledHeight
        //   ) {
        //     next.y +=
        //       editor.viewportPageBounds.maxY -
        //       currentPresentationPage?.scaledHeight;
        //   }
        //   if (next.x > 0 || editor.viewportPageBounds.minX < 0) {
        //     next.x = 0;
        //   }
        //   if (next.y > 0 || editor.viewportPageBounds.minY < 0) {
        //     next.y = 0;
        //   }
        // }
        return next;
      };
    }

    isMountedRef.current = true;
  };

  return (
    <div
      ref={whiteboardRef}
      id={"whiteboard-element"}
      key={`animations=-${animations}-${hasWBAccess}-${isPresenter}-${isModerator}-${whiteboardToolbarAutoHide}-${language}`}
    >
      <Tldraw
        key={`tldrawv2-${curPageId}-${presentationId}-${animations}-${shapes}`}
        forceMobile={true}
        hideUi={hasWBAccess || isPresenter ? false : true}
        onMount={handleTldrawMount}
      />
      <Styled.TldrawV2GlobalStyle
        {...{ hasWBAccess, isPresenter, isRTL, isMultiUserActive }}
      />
    </div>
  );
});

Whiteboard.propTypes = {
  isPresenter: PropTypes.bool.isRequired,
  isIphone: PropTypes.bool.isRequired,
  removeShapes: PropTypes.func.isRequired,
  initDefaultPages: PropTypes.func.isRequired,
  persistShape: PropTypes.func.isRequired,
  notifyNotAllowedChange: PropTypes.func.isRequired,
  shapes: PropTypes.objectOf(PropTypes.shape).isRequired,
  assets: PropTypes.objectOf(PropTypes.shape).isRequired,
  currentUser: PropTypes.shape({
    userId: PropTypes.string.isRequired,
  }).isRequired,
  whiteboardId: PropTypes.string,
  zoomSlide: PropTypes.func.isRequired,
  skipToSlide: PropTypes.func.isRequired,
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
  hasShapeAccess: PropTypes.func.isRequired,
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
  nextSlide: PropTypes.func.isRequired,
  numberOfSlides: PropTypes.number.isRequired,
  previousSlide: PropTypes.func.isRequired,
  sidebarNavigationWidth: PropTypes.number,
  presentationId: PropTypes.string,
};

Whiteboard.defaultProps = {
  fullscreenRef: undefined,
  svgUri: undefined,
  whiteboardId: undefined,
  sidebarNavigationWidth: 0,
  presentationId: undefined,
};