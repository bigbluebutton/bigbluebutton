import * as React from "react";
import _ from "lodash";
import styled, { createGlobalStyle } from "styled-components";
import Cursors from "./cursors/container";
import { TldrawApp, Tldraw } from "@tldraw/tldraw";
import SlideCalcUtil, {HUNDRED_PERCENT} from '/imports/utils/slideCalcUtils';
import { Utils } from "@tldraw/core";
import Settings from '/imports/ui/services/settings';
import logger from '/imports/startup/client/logger';
import KEY_CODES from '/imports/utils/keyCodes';
import { presentationMenuHeight, borderSize, borderSizeLarge } from '/imports/ui/stylesheets/styled-components/general';
import { colorWhite, colorBlack } from '/imports/ui/stylesheets/styled-components/palette';
import Styled from './styles';
import PanToolInjector from './pan-tool-injector/component';

function usePrevious(value) {
  const ref = React.useRef();
  React.useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

const findRemoved = (A, B) => {
  return A.filter((a) => {
    return !B.includes(a);
  });
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

const SMALL_HEIGHT = 435;
const SMALLEST_HEIGHT = 363;
const SMALL_WIDTH = 800;
const SMALLEST_WIDTH = 645;
const TOOLBAR_SMALL = 28;
const TOOLBAR_LARGE = 38;
const TOOLBAR_OFFSET = 0;
const DEFAULT_TOOL_COUNT = 9;

const TldrawGlobalStyle = createGlobalStyle`
  ${({ hideContextMenu }) => hideContextMenu && `
    #TD-ContextMenu {
      display: none;
    }
  `}
  ${({ isRTL }) => `
    #TD-StylesMenu {
      position: relative;
      right: ${isRTL ? '7rem' : '-7rem'};
    }
  `}
  #TD-PrimaryTools-Image {
    display: none;
  }
  #slide-background-shape div {
    pointer-events: none;
  }
  div[dir*="ltr"]:has(button[aria-expanded*="false"][aria-controls*="radix-"]) {
    pointer-events: none;
  }
  [aria-expanded*="false"][aria-controls*="radix-"] {
    display: none;
  }
  [class$="-side-right"] {
    top: -1px;
  }
  ${({ hasWBAccess, isPresenter, size }) => (hasWBAccess || isPresenter) && `
    #TD-Tools-Dots {
      height: ${size}px;
      width: ${size}px;
    }
    #TD-Delete {
      & button {
        height: ${size}px;
        width: ${size}px;
      }
    }
    #TD-PrimaryTools button {
        height: ${size}px;
        width: ${size}px;
    }
    #TD-Styles {
      border-width: ${borderSize};
    }
    #TD-TopPanel-Undo,
    #TD-TopPanel-Redo,
    #TD-Styles {
      height: 92%;
      border-radius: 7px;

      &:hover {
        border: solid ${borderSize} #ECECEC;
        background-color: #ECECEC;
      }
      &:focus {
        border: solid ${borderSize} ${colorBlack};
      }
    }
    #TD-Styles,
    #TD-TopPanel-Undo,
    #TD-TopPanel-Redo {
      margin: ${borderSize} ${borderSizeLarge} 0px ${borderSizeLarge};
    }
  `}
  ${({ darkTheme }) => darkTheme && `
    #TD-TopPanel-Undo,
    #TD-TopPanel-Redo,
    #TD-Styles {
      &:focus {
        border: solid ${borderSize} ${colorWhite} !important;
      }
    }
  `}
`;

const EditableWBWrapper = styled.div`
  &, & > :first-child {
    cursor: inherit !important;
  }
`;

export default function Whiteboard(props) {
  const {
    isPresenter,
    isModerator,
    removeShapes,
    initDefaultPages,
    persistShape,
    notifyNotAllowedChange,
    shapes,
    assets,
    currentUser,
    curPres,
    whiteboardId,
    podId,
    zoomSlide,
    skipToSlide,
    slidePosition,
    curPageId,
    presentationWidth,
    presentationHeight,
    isViewersCursorLocked,
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
    isPanning: shortcutPanning,
  } = props;
  const { pages, pageStates } = initDefaultPages(curPres?.pages.length || 1);
  const rDocument = React.useRef({
    name: "test",
    version: TldrawApp.version,
    id: whiteboardId,
    pages,
    pageStates,
    bindings: {},
    assets: {},
  });
  const [tldrawAPI, setTLDrawAPI] = React.useState(null);
  const [history, setHistory] = React.useState(null);
  const [forcePanning, setForcePanning] = React.useState(false);
  const [zoom, setZoom] = React.useState(HUNDRED_PERCENT);
  const [tldrawZoom, setTldrawZoom] = React.useState(1);
  const [enable, setEnable] = React.useState(true);
  const [isMounting, setIsMounting] = React.useState(true);
  const prevShapes = usePrevious(shapes);
  const prevSlidePosition = usePrevious(slidePosition);
  const prevFitToWidth = usePrevious(fitToWidth);
  const prevSvgUri = usePrevious(svgUri);
  const language = mapLanguage(Settings?.application?.locale?.toLowerCase() || 'en');
  const [currentTool, setCurrentTool] = React.useState(null);
  const [isMoving, setIsMoving] = React.useState(false);
  const [isPanning, setIsPanning] = React.useState(shortcutPanning);
  const [panSelected, setPanSelected] = React.useState(isPanning);
  const isMountedRef = React.useRef(true);

  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const setSafeTLDrawAPI = (api) => {
    if (isMountedRef.current) {
      setTLDrawAPI(api);
    }
  };

  const setSafeCurrentTool = (tool) => {
    if (isMountedRef.current) {
      setCurrentTool(tool);
    }
  };

  const toggleOffCheck = (evt) => {
    const clickedElement = evt.target;
    const toolbar = document.getElementById("TD-PrimaryTools");
    const panBtnClicked = clickedElement?.getAttribute('data-test') === 'panButton'
    || clickedElement?.parentElement?.getAttribute('data-test') === 'panButton';
    const panButton = document.querySelector('[data-test="panButton"]');
    if (panBtnClicked) {
      const dataZoom = panButton.getAttribute('data-zoom');
      if ((dataZoom <= HUNDRED_PERCENT && !fitToWidth)) {
        return; 
      }
      panButton.classList.add('select');
      panButton.classList.remove('selectOverride');
      return;
    } else {
      setIsPanning(false);
      setPanSelected(false);
      panButton.classList.add('selectOverride');
      panButton.classList.remove('select');
    }
  };

  React.useEffect(() => {
    const toolbar = document.getElementById("TD-PrimaryTools");
    const handleClick = (evt) => {
      toggleOffCheck(evt);
    };
    toolbar?.addEventListener('click', handleClick);
    return () => {
      toolbar?.removeEventListener('click', handleClick);
    };
  }, [tldrawAPI]);

  const throttledResetCurrentPoint = React.useRef(_.throttle(() => {
    setEnable(false);
    setEnable(true);
  }, 1000, { trailing: true }));

  const calculateZoom = (width, height) => {
    const calcedZoom = fitToWidth ? (presentationWidth / width) : Math.min(
      (presentationWidth) / width,
      (presentationHeight) / height
    );

    return (calcedZoom === 0 || calcedZoom === Infinity) ? HUNDRED_PERCENT : calcedZoom;
  }

  const isValidShapeType = (shape) => {
    const invalidTypes = ['image', 'video'];
    return !invalidTypes.includes(shape?.type);
  }

  const filterInvalidShapes = (shapes) => {
    const keys = Object.keys(shapes);
    const removedChildren = [];
    const removedParents = [];

    keys.forEach((shape) => {
      if (shapes[shape].parentId !== curPageId) {
        if(!keys.includes(shapes[shape].parentId)) {
          delete shapes[shape];
        }
      }else{
        if (shapes[shape].type === "group") {
          const groupChildren = shapes[shape].children;

          groupChildren.forEach((child) => {
            if (!keys.includes(child)) {
              removedChildren.push(child);
            }
          });
          shapes[shape].children = groupChildren.filter((child) => !removedChildren.includes(child));

          if (shapes[shape].children.length < 2) {
            removedParents.push(shape);
            delete shapes[shape];
          }
        }
      }
    });
    // remove orphaned children
    Object.keys(shapes).forEach((shape) => {
      if (shapes[shape] && shapes[shape].parentId !== curPageId) {
        if (removedParents.includes(shapes[shape].parentId)) {
          delete shapes[shape];
        }
      }

      //remove orphaned bindings
      if (shapes[shape] && shapes[shape].type === "arrow" &&
        (shapes[shape].handles.start.bindingId || shapes[shape].handles.end.bindingId)) {
        const startBinding = shapes[shape].handles.start.bindingId;
        const endBinding = shapes[shape].handles.end.bindingId;

        const startBindingData = tldrawAPI?.getBinding(startBinding);
        const endBindingData = tldrawAPI?.getBinding(endBinding);

        if (startBinding && (!startBindingData && (
          removedParents.includes(startBindingData?.fromId) ||
          removedParents.includes(startBindingData?.toId) ||
          !keys.includes(startBindingData?.fromId) ||
          !keys.includes(startBindingData?.toId)
        ))) {
          delete shapes[shape].handles.start.bindingId;
        }
        if (endBinding && (!endBindingData && (
          removedParents.includes(endBindingData?.fromId) ||
          removedParents.includes(endBindingData?.toId) ||
          !keys.includes(endBindingData?.fromId) ||
          !keys.includes(endBindingData?.toId)
        ))) {
          delete shapes[shape].handles.end.bindingId;
        }
      }
    });
    return shapes;
  }

  const sendShapeChanges= (app, changedShapes, redo = false) => {
    const invalidChange = Object.keys(changedShapes)
      .find(id => !hasShapeAccess(id));

    const invalidShapeType = Object.keys(changedShapes)
      .find(id => !isValidShapeType(changedShapes[id]));

    const currentShapes = app?.document?.pages[app?.currentPageId]?.shapes;
    // -1 for background shape
    const shapeNumberExceeded = Object.keys(currentShapes).length - 1 > maxNumberOfAnnotations;

    const isInserting = Object.keys(changedShapes)
      .filter(
        shape => typeof changedShapes[shape] === 'object'
          && changedShapes[shape].type
          && !prevShapes[shape]
      ).length !== 0;

    if (invalidChange || invalidShapeType || (shapeNumberExceeded && isInserting)) {
      if (shapeNumberExceeded) {
        notifyShapeNumberExceeded(intl, maxNumberOfAnnotations);
      } else {
        notifyNotAllowedChange(intl);
      }
      // undo last command without persisting to not generate the onUndo/onRedo callback
      if (!redo) {
        const command = app.stack[app.pointer];
        app.pointer--;
        return app.applyPatch(command.before, `undo`);
      } else {
        app.pointer++
        const command = app.stack[app.pointer]
        return app.applyPatch(command.after, 'redo');
      }
    };
    let deletedShapes = [];
    Object.entries(changedShapes)
          .forEach(([id, shape]) => {
            if (!shape) deletedShapes.push(id);
            else {
              //checks to find any bindings assosiated with the changed shapes.
              //If any, they may need to be updated as well.
              const pageBindings = app.page.bindings;
              if (pageBindings) {
                Object.entries(pageBindings).map(([k,b]) => {
                  if (b.toId.includes(id)) {
                    const boundShape = app.getShape(b.fromId);
                    if (shapes[b.fromId] && !_.isEqual(boundShape, shapes[b.fromId])) {
                      const shapeBounds = app.getShapeBounds(b.fromId);
                      boundShape.size = [shapeBounds.width, shapeBounds.height];
                      persistShape(boundShape, whiteboardId)
                    }
                  }
                })
              }
              if (!shape.id) {
                // check it already exists (otherwise we need the full shape)
                if (!shapes[id]) {
                  shape = app.getShape(id);
                }
                shape.id = id;
              }
              const shapeBounds = app.getShapeBounds(id);
              const size = [shapeBounds.width, shapeBounds.height];
              if (!shapes[id] || (shapes[id] && !_.isEqual(shapes[id].size, size))) {
                shape.size = size;
              }
              if (!shapes[id] || (shapes[id] && !shapes[id].userId)) shape.userId = currentUser?.userId;
              persistShape(shape, whiteboardId);
            }
          });

    //order the ids of shapes being deleted to prevent crash when removing a group shape before its children
    const orderedDeletedShapes = [];
    deletedShapes.forEach(eid => {
      if (shapes[eid]?.type !== 'group') {
        orderedDeletedShapes.unshift(eid);
      } else {
        orderedDeletedShapes.push(eid)
      }
    });

    if (orderedDeletedShapes.length > 0) {
      removeShapes(orderedDeletedShapes, whiteboardId);
    }
  }

  React.useEffect(() => {
    props.setTldrawIsMounting(true);
  }, []);

  const checkClientBounds = (e) => {
    if (
      e.clientX > document.documentElement.clientWidth ||
      e.clientX < 0 ||
      e.clientY > document.documentElement.clientHeight ||
      e.clientY < 0
    ) {
      if (tldrawAPI?.session) {
        tldrawAPI?.completeSession?.();
      }
    }
  };

  const checkVisibility = () => {
    if (document.visibilityState === 'hidden' && tldrawAPI?.session) {
      tldrawAPI?.completeSession?.();
    }
  };

  React.useEffect(() => {
    document.addEventListener('mouseup', checkClientBounds);
    document.addEventListener('visibilitychange', checkVisibility);

    return () => {
      document.removeEventListener('mouseup', checkClientBounds);
      document.removeEventListener('visibilitychange', checkVisibility);
    };
  }, [tldrawAPI]);

  const doc = React.useMemo(() => {
    const currentDoc = rDocument.current;

    let next = { ...currentDoc };

    let changed = false;

    if (next.pageStates[curPageId] && !_.isEqual(prevShapes, shapes)) {
      const editingShape = tldrawAPI?.getShape(tldrawAPI?.getPageState()?.editingId);

      if (editingShape) {
        shapes[editingShape?.id] = editingShape;
      }

      const removed = prevShapes && findRemoved(Object.keys(prevShapes),Object.keys((shapes)));
      if (removed && removed.length > 0) {
        const patchedShapes = Object.fromEntries(removed.map((id) => [id, undefined]));

        try {
          tldrawAPI?.patchState(
            {
              document: {
                pageStates: {
                  [curPageId]: {
                    selectedIds: tldrawAPI?.selectedIds?.filter(id => !removed.includes(id)) || [],
                  },
                },
                pages: {
                  [curPageId]: {
                    shapes: patchedShapes,
                  },
                },
              },
            },
          );
        } catch (error) {
          logger.error({
            logCode: 'whiteboard_shapes_remove_error',
            extraInfo: { error },
          }, 'Whiteboard catch error on removing shapes');
        }

      }

      next.pages[curPageId].shapes = filterInvalidShapes(shapes);
      changed = true;
    }

    if (curPageId && (!next.assets[`slide-background-asset-${curPageId}`]) || (svgUri && !_.isEqual(prevSvgUri, svgUri))) {
      next.assets[`slide-background-asset-${curPageId}`] = assets[`slide-background-asset-${curPageId}`]
      tldrawAPI?.patchState(
        {
          document: {
            assets: assets
          },
        },
      );
      changed = true;
    }

    if (changed && tldrawAPI) {
      // merge patch manually (this improves performance and reduce side effects on fast updates)
      const patch = {
        document: {
          pages: {
            [curPageId]: { shapes: filterInvalidShapes(shapes) }
          },
        },
      };
      const prevState = tldrawAPI._state;
      const nextState = Utils.deepMerge(tldrawAPI._state, patch);
      if(nextState.document.pages[curPageId].shapes) {
        filterInvalidShapes(nextState.document.pages[curPageId].shapes);
      }
      const final = tldrawAPI.cleanup(nextState, prevState, patch, '');
      tldrawAPI._state = final;

      try {
        tldrawAPI?.forceUpdate();
      } catch (e) {
        logger.error({
          logCode: 'whiteboard_shapes_update_error',
          extraInfo: { error },
        }, 'Whiteboard catch error on updating shapes');
      }
    }

    // move poll result text to bottom right
    if (next.pages[curPageId] && slidePosition) {
      const pollResults = Object.entries(next.pages[curPageId].shapes)
                                .filter(([id, shape]) => shape.name?.includes("poll-result"))
      for (const [id, shape] of pollResults) {
        if (_.isEqual(shape.point, [0, 0])) {
          const shapeBounds = tldrawAPI?.getShapeBounds(id);
          if (shapeBounds) {
            shape.point = [
              slidePosition.width - shapeBounds.width,
              slidePosition.height - shapeBounds.height
            ]
            shape.size = [shapeBounds.width, shapeBounds.height]
            isPresenter && persistShape(shape, whiteboardId);
          }
        }
      };
    }

    return currentDoc;
  }, [shapes, tldrawAPI, curPageId, slidePosition]);

  // when presentationSizes change, update tldraw camera
  React.useEffect(() => {
    if (curPageId && slidePosition && tldrawAPI && presentationWidth > 0 && presentationHeight > 0) {
      if (prevFitToWidth !== null && fitToWidth !== prevFitToWidth) {
        const zoom = calculateZoom(slidePosition.width, slidePosition.height)
        tldrawAPI?.setCamera([0, 0], zoom);
        const viewedRegionH = SlideCalcUtil.calcViewedRegionHeight(tldrawAPI?.viewport.height, slidePosition.height);
        setZoom(HUNDRED_PERCENT);
        zoomChanger(HUNDRED_PERCENT);
        zoomSlide(parseInt(curPageId), podId, HUNDRED_PERCENT, viewedRegionH, 0, 0);
      } else {
        const currentAspectRatio =  Math.round((presentationWidth / presentationHeight) * 100) / 100;
        const previousAspectRatio = Math.round((slidePosition.viewBoxWidth / slidePosition.viewBoxHeight) * 100) / 100;
        if (fitToWidth && currentAspectRatio !== previousAspectRatio) {
          // we need this to ensure tldraw updates the viewport size after re-mounting
          setTimeout(() => {
            const zoom = calculateZoom(slidePosition.viewBoxWidth, slidePosition.viewBoxHeight);
            tldrawAPI.setCamera([slidePosition.x, slidePosition.y], zoom, 'zoomed');
          }, 50);
        } else {
          const zoom = calculateZoom(slidePosition.viewBoxWidth, slidePosition.viewBoxHeight);
          tldrawAPI?.setCamera([slidePosition.x, slidePosition.y], zoom);
        }
      }
    }
  }, [presentationWidth, presentationHeight, curPageId, document?.documentElement?.dir]);

  React.useEffect(() => {
    if (presentationWidth > 0 && presentationHeight > 0 && slidePosition) {
      const cameraZoom = tldrawAPI?.getPageState()?.camera?.zoom;
      const newzoom = calculateZoom(slidePosition.viewBoxWidth, slidePosition.viewBoxHeight);
      if (cameraZoom && cameraZoom === 1) {
          tldrawAPI?.setCamera([slidePosition.x, slidePosition.y], newzoom);
      } else if (isMounting) {
        setIsMounting(false);
        props.setTldrawIsMounting(false);
        const currentAspectRatio =  Math.round((presentationWidth / presentationHeight) * 100) / 100;
        const previousAspectRatio = Math.round((slidePosition.viewBoxWidth / slidePosition.viewBoxHeight) * 100) / 100;
        // case where the presenter had fit-to-width enabled and he reloads the page
        if (!fitToWidth && currentAspectRatio !== previousAspectRatio) {
          // wee need this to ensure tldraw updates the viewport size after re-mounting
          setTimeout(() => {
            tldrawAPI?.setCamera([slidePosition.x, slidePosition.y], newzoom, 'zoomed');
          }, 50);
        } else {
          tldrawAPI?.setCamera([slidePosition.x, slidePosition.y], newzoom);
        }
      }
    }
  }, [tldrawAPI?.getPageState()?.camera, presentationWidth, presentationHeight]);

  // change tldraw page when presentation page changes
  React.useEffect(() => {
    if (tldrawAPI && curPageId && slidePosition) {
      tldrawAPI.changePage(curPageId);
      let zoom = prevSlidePosition
        ? calculateZoom(prevSlidePosition.viewBoxWidth, prevSlidePosition.viewBoxHeight)
        : calculateZoom(slidePosition.viewBoxWidth, slidePosition.viewBoxHeight)
      tldrawAPI?.setCamera([slidePosition.x, slidePosition.y], zoom, 'zoomed_previous_page');
    }
  }, [curPageId]);

  // change tldraw camera when slidePosition changes
  React.useEffect(() => {
    if (tldrawAPI && !isPresenter && curPageId && slidePosition) {
      const zoom = calculateZoom(slidePosition.viewBoxWidth, slidePosition.viewBoxHeight)
      tldrawAPI?.setCamera([slidePosition.x, slidePosition.y], zoom, 'zoomed');
    }
  }, [curPageId, slidePosition]);

  // update zoom according to toolbar
  React.useEffect(() => {
    if (tldrawAPI && isPresenter && curPageId && slidePosition && zoom !== zoomValue) {
      const zoomFitSlide = calculateZoom(slidePosition.width, slidePosition.height);
      const zoomCamera = (zoomFitSlide * zoomValue) / HUNDRED_PERCENT;
      setTimeout(() => {
        tldrawAPI?.zoomTo(zoomCamera);
      }, 50);
    }

    if (zoomValue <= HUNDRED_PERCENT) {
      setPanSelected(false);
      setIsPanning(false);
      tldrawAPI?.selectTool('select');
    }
  }, [zoomValue]);

  // update zoom when presenter changes if the aspectRatio has changed
  React.useEffect(() => {
    if (tldrawAPI && isPresenter && curPageId && slidePosition && !isMounting) {
      const currentAspectRatio =  Math.round((presentationWidth / presentationHeight) * 100) / 100;
      const previousAspectRatio = Math.round((slidePosition.viewBoxWidth / slidePosition.viewBoxHeight) * 100) / 100;
      if (previousAspectRatio !== currentAspectRatio) {
        if (fitToWidth) {
          const zoom = calculateZoom(slidePosition.width, slidePosition.height)
          tldrawAPI?.setCamera([0, 0], zoom);
          const viewedRegionH = SlideCalcUtil.calcViewedRegionHeight(tldrawAPI?.viewport.height, slidePosition.height);
          zoomSlide(parseInt(curPageId), podId, HUNDRED_PERCENT, viewedRegionH, 0, 0);
          setZoom(HUNDRED_PERCENT);
          zoomChanger(HUNDRED_PERCENT);
        } else if (!isMounting) {
          let viewedRegionW = SlideCalcUtil.calcViewedRegionWidth(tldrawAPI?.viewport.width, slidePosition.width);
          let viewedRegionH = SlideCalcUtil.calcViewedRegionHeight(tldrawAPI?.viewport.height, slidePosition.height);
          const camera = tldrawAPI?.getPageState()?.camera;
          const zoomFitSlide = calculateZoom(slidePosition.width, slidePosition.height);
          if (!fitToWidth && camera.zoom === zoomFitSlide) {
            viewedRegionW = HUNDRED_PERCENT;
            viewedRegionH = HUNDRED_PERCENT;
          }
          zoomSlide(parseInt(curPageId), podId, viewedRegionW, viewedRegionH, camera.point[0], camera.point[1]);
          const zoomToolbar = Math.round((HUNDRED_PERCENT * camera.zoom) / zoomFitSlide * 100) / 100;
          if (zoom !== zoomToolbar) {
            setZoom(zoomToolbar);
            zoomChanger(zoomToolbar);
          }
        }
      }
    }
  }, [isPresenter]);

  const hasWBAccess = props?.hasMultiUserAccess(props.whiteboardId, props.currentUser.userId);

  React.useEffect(() => {
    if (tldrawAPI) {
      tldrawAPI.isForcePanning = isPanning;
    }
  }, [isPanning]);

  React.useEffect(() => {
    tldrawAPI?.setSetting('language', language);
  }, [language]);

  // Reset zoom to default when current presentation changes.
  React.useEffect(() => {
    if (isPresenter && slidePosition && tldrawAPI) {
      tldrawAPI.zoomTo(0);
    }
  }, [curPres?.id]);

  React.useEffect(() => {
    const currentZoom = tldrawAPI?.getPageState()?.camera?.zoom;

    if(currentZoom !== tldrawZoom) {
      setTldrawZoom(currentZoom);
    }else{
      throttledResetCurrentPoint.current();
    }
  }, [presentationAreaHeight, presentationAreaWidth]);

  const fullscreenToggleHandler = () => {
    const {
      fullscreenElementId,
      isFullscreen,
      layoutContextDispatch,
      fullscreenAction,
      fullscreenRef,
      handleToggleFullScreen,
    } = props;

    handleToggleFullScreen(fullscreenRef);
    const newElement = isFullscreen ? '' : fullscreenElementId;

    layoutContextDispatch({
      type: fullscreenAction,
      value: {
        element: newElement,
        group: '',
      },
    });
  }

  const nextSlideHandler = (event) => {
    const {
      nextSlide, curPageId, numberOfSlides, podId,
    } = props;

    if (event) event.currentTarget.blur();
    nextSlide(+curPageId, numberOfSlides, podId);
  }

  const previousSlideHandler = (event) => {
    const { previousSlide, curPageId, podId } = props;

    if (event) event.currentTarget.blur();
    previousSlide(+curPageId, podId);
  }

  const switchSlide = (event) => {
    const { which } = event;

    switch (which) {
      case KEY_CODES.ARROW_LEFT:
      case KEY_CODES.PAGE_UP:
        previousSlideHandler();
        break;
      case KEY_CODES.ARROW_RIGHT:
      case KEY_CODES.PAGE_DOWN:
        nextSlideHandler();
        break;
      case KEY_CODES.ENTER:
        fullscreenToggleHandler();
        break;
      default:
    }
  }

  const onMount = (app) => {
    const menu = document.getElementById("TD-Styles")?.parentElement;
    setSafeCurrentTool('select');

    if (menu) {
      const MENU_OFFSET = `48px`;
      menu.style.position = `relative`;
      menu.style.height = presentationMenuHeight;
      if (isRTL) {
        menu.style.left = MENU_OFFSET;
      } else {
        menu.style.right = MENU_OFFSET;
      }

      [...menu.children]
        .sort((a,b)=> a?.id>b?.id?-1:1)
        .forEach(n=> menu.appendChild(n));
    }
    app.setSetting('language', language);
    app?.setSetting('isDarkMode', false);
    app?.patchState(
      {
        appState: {
          currentStyle: {
            textAlign: isRTL ? "end" : "start",
            font: fontFamily,
          },
        },
      }
    );

    setSafeTLDrawAPI(app);
    props.setTldrawAPI(app);
    // disable for non presenter that doesn't have multi user access
    if (!hasWBAccess && !isPresenter) {
      app.onPan = () => {};
      app.setSelectedIds = () => {};
      app.setHoveredId = () => {};
    }

    if (curPageId) {
      app.changePage(curPageId);
      setIsMounting(true);
    }

    if (history) {
      app.replaceHistory(history);
    }
  };

  const onPatch = (e, t, reason) => {
    if (!e?.pageState || !reason) return;
    if (((isPanning || panSelected) && (reason === 'selected' || reason === 'set_hovered_id'))) {
      return e.patchState(
        {
          document: {
            pageStates: {
              [e.getPage()?.id]: {
                selectedIds: [],
                hoveredId: null,
              },
            },
          },
        }
      );
    }

    // don't allow select others shapes for editing if don't have permission
    if (reason && reason.includes("set_editing_id")) {
      if (!hasShapeAccess(e.pageState.editingId)) {
        e.pageState.editingId = null;
      }
    }
    // don't allow hover others shapes for editing if don't have permission
    if (reason && reason.includes("set_hovered_id")) {
      if (!hasShapeAccess(e.pageState.hoveredId)) {
        e.pageState.hoveredId = null;
      }
    }
    // don't allow select others shapes if don't have permission
    if (reason && reason.includes("selected")) {
      const validIds = [];
      e.pageState.selectedIds.forEach(id => hasShapeAccess(id) && validIds.push(id));
      e.pageState.selectedIds = validIds;
      e.patchState(
        {
          document: {
            pageStates: {
              [e.getPage()?.id]: {
                selectedIds: validIds,
              },
            },
          },
        }
      );
    }
    // don't allow selecting others shapes with ctrl (brush)
    if (e?.session?.type === "brush" && e?.session?.status === "brushing") {
      const validIds = [];
      e.pageState.selectedIds.forEach(id => hasShapeAccess(id) && validIds.push(id));
      e.pageState.selectedIds = validIds;
      if (!validIds.find(id => id === e.pageState.hoveredId)) {
        e.pageState.hoveredId = undefined;
      }
    }

    // change cursor when moving shapes
    if (e?.session?.type === "translate" && e?.session?.status === "translating") {
      if (!isMoving) setIsMoving(true);
      if (reason === "set_status:idle") setIsMoving(false);
    }

    if (reason && isPresenter && slidePosition && (reason.includes("zoomed") || reason.includes("panned"))) {
      const camera = tldrawAPI?.getPageState()?.camera;

      // limit bounds
      if (tldrawAPI?.viewport.maxX > slidePosition.width) {
        camera.point[0] = camera.point[0] + (tldrawAPI?.viewport.maxX - slidePosition.width);
      }
      if (tldrawAPI?.viewport.maxY > slidePosition.height) {
        camera.point[1] = camera.point[1] + (tldrawAPI?.viewport.maxY - slidePosition.height);
      }
      if (camera.point[0] > 0 || tldrawAPI?.viewport.minX < 0) {
        camera.point[0] = 0;
      }
      if (camera.point[1] > 0 || tldrawAPI?.viewport.minY < 0) {
        camera.point[1] = 0;
      }
      const zoomFitSlide = calculateZoom(slidePosition.width, slidePosition.height);
      if (camera.zoom < zoomFitSlide) {
        camera.zoom = zoomFitSlide;
      }

      tldrawAPI?.setCamera([camera.point[0], camera.point[1]], camera.zoom);

      const zoomToolbar = Math.round((HUNDRED_PERCENT * camera.zoom) / zoomFitSlide * 100) / 100;
      if (zoom !== zoomToolbar) {
        setZoom(zoomToolbar);
        isPresenter && zoomChanger(zoomToolbar);
      }

      let viewedRegionW = SlideCalcUtil.calcViewedRegionWidth(tldrawAPI?.viewport.width, slidePosition.width);
      let viewedRegionH = SlideCalcUtil.calcViewedRegionHeight(tldrawAPI?.viewport.height, slidePosition.height);

      if (!fitToWidth && camera.zoom === zoomFitSlide) {
        viewedRegionW = HUNDRED_PERCENT;
        viewedRegionH = HUNDRED_PERCENT;
      }

      zoomSlide(parseInt(curPageId), podId, viewedRegionW, viewedRegionH, camera.point[0], camera.point[1]);
    }
    //don't allow non-presenters to pan&zoom
    if (slidePosition && reason && !isPresenter && (reason.includes("zoomed") || reason.includes("panned"))) {
      const zoom = calculateZoom(slidePosition.viewBoxWidth, slidePosition.viewBoxHeight)
      tldrawAPI?.setCamera([slidePosition.x, slidePosition.y], zoom);
    }
    // disable select for non presenter that doesn't have multi user access
    if (!hasWBAccess && !isPresenter) {
      if (e?.getPageState()?.brush || e?.selectedIds?.length !== 0) {
        e.patchState(
          {
            document: {
              pageStates: {
                [e?.currentPageId]: {
                  selectedIds: [],
                  brush: null,
                },
              },
            },
          },
        );
      }
    }

    if (reason && reason === 'patched_shapes' && e?.session?.type === 'edit') {
      const patchedShape = e?.getShape(e?.getPageState()?.editingId);

      if (e?.session?.initialShape?.type === 'sticky' && patchedShape?.text?.length > maxStickyNoteLength) {
        patchedShape.text = patchedShape.text.substring(0, maxStickyNoteLength);
      }

      if (e?.session?.initialShape?.type === 'text' && !shapes[patchedShape.id]) {
        // check for maxShapes
        const currentShapes = e?.document?.pages[e?.currentPageId]?.shapes;
        const shapeNumberExceeded = Object.keys(currentShapes).length - 1 > maxNumberOfAnnotations;
        if (shapeNumberExceeded) {
          notifyShapeNumberExceeded(intl, maxNumberOfAnnotations);
          e?.cancelSession?.();
        } else {
          patchedShape.userId = currentUser?.userId;
          persistShape(patchedShape, whiteboardId);
        }
      } else {
        const diff = {
          id: patchedShape.id,
          point: patchedShape.point,
          text: patchedShape.text,
        };
        persistShape(diff, whiteboardId);
      }
    }

    if (reason && reason.includes('selected_tool')) {
      const tool = reason.split(':')[1];
      setCurrentTool(tool);
      setPanSelected(false);
      setIsPanning(false);
    }
  };

  const onUndo = (app) => {
    if (app.currentPageId !== curPageId) {
      if (isPresenter) {
        // change slide for others
        skipToSlide(Number.parseInt(app.currentPageId), podId)
      } else {
        // ignore, stay on same page
        app.changePage(curPageId);
      }
      return;
    }
    const lastCommand = app.stack[app.pointer+1];
    const changedShapes = lastCommand?.before?.document?.pages[app.currentPageId]?.shapes;
    if (changedShapes) {
      sendShapeChanges(app, changedShapes, true);
    }
  };

  const onRedo = (app) => { 
    if (app.currentPageId !== curPageId) {
      if (isPresenter) {
        // change slide for others
        skipToSlide(Number.parseInt(app.currentPageId), podId)
      } else {
        // ignore, stay on same page
        app.changePage(curPageId);
      }
      return;
    }
    const lastCommand = app.stack[app.pointer];
    const changedShapes = lastCommand?.after?.document?.pages[app.currentPageId]?.shapes;
    if (changedShapes) {
      sendShapeChanges(app, changedShapes);
    }
  };

  const onCommand = (app, command, reason) => {
    setHistory(app.history);
    const changedShapes = command.after?.document?.pages[app.currentPageId]?.shapes;
    if (!isMounting && app.currentPageId !== curPageId) {
      // can happen then the "move to page action" is called, or using undo after changing a page
      const currentPage = curPres.pages.find(page => page.num === Number.parseInt(app.currentPageId));
      if (!currentPage) return;
      const newWhiteboardId = currentPage.id;
      //remove from previous page and persist on new
      changedShapes && removeShapes(Object.keys(changedShapes), whiteboardId);
      changedShapes && Object.entries(changedShapes)
                             .forEach(([id, shape]) => {
                               const shapeBounds = app.getShapeBounds(id);
                               shape.size = [shapeBounds.width, shapeBounds.height];
                               persistShape(shape, newWhiteboardId);
                             });
      if (isPresenter) {
        // change slide for others
        skipToSlide(Number.parseInt(app.currentPageId), podId)
      } else {
        // ignore, stay on same page
        app.changePage(curPageId);
      }
    }
    else if (changedShapes) {
      sendShapeChanges(app, changedShapes);
    }
  };

  const webcams = document.getElementById('cameraDock');
  const dockPos = webcams?.getAttribute("data-position");

  if (currentTool && !isPanning) tldrawAPI?.selectTool(currentTool);

  const editableWB = (
    <EditableWBWrapper onKeyDown={switchSlide}>
      <Tldraw
        key={`wb-${isRTL}-${dockPos}-${forcePanning}`}
        document={doc}
        // disable the ability to drag and drop files onto the whiteboard
        // until we handle saving of assets in akka.
        disableAssets={true}
        // Disable automatic focus. Users were losing focus on shared notes
        // and chat on presentation mount.
        autofocus={false}
        onMount={onMount}
        showPages={false}
        showZoom={false}
        showUI={curPres ? (isPresenter || hasWBAccess) : true}
        showMenu={curPres ? false : true}
        showMultiplayerMenu={false}
        readOnly={false}
        onPatch={onPatch}
        onUndo={onUndo}
        onRedo={onRedo}
        onCommand={onCommand}
      />
    </EditableWBWrapper>
  );

  const readOnlyWB = (
    <Tldraw
      key={`wb-readOnly`}
      document={doc}
      onMount={onMount}
      // disable the ability to drag and drop files onto the whiteboard
      // until we handle saving of assets in akka.
      disableAssets={true}
      // Disable automatic focus. Users were losing focus on shared notes
      // and chat on presentation mount.
      autofocus={false}
      showPages={false}
      showZoom={false}
      showUI={false}
      showMenu={false}
      showMultiplayerMenu={false}
      readOnly={true}
      onPatch={onPatch}
    />
  );

  const size = ((props.height < SMALL_HEIGHT) || (props.width < SMALL_WIDTH))
  ? TOOLBAR_SMALL : TOOLBAR_LARGE;

  if ((panSelected||isPanning) && tldrawAPI) {
    tldrawAPI.isForcePanning = isPanning;
  }

  if (hasWBAccess || isPresenter) {
    if (((props.height < SMALLEST_HEIGHT) || (props.width < SMALLEST_WIDTH))) {
      tldrawAPI?.setSetting('dockPosition', 'bottom');
    } else {
      tldrawAPI?.setSetting('dockPosition', isRTL ? 'left' : 'right');
    }
  }

  return (
    <>
      <Cursors
        tldrawAPI={tldrawAPI}
        currentUser={currentUser}
        hasMultiUserAccess={props?.hasMultiUserAccess}
        whiteboardId={whiteboardId}
        isViewersCursorLocked={isViewersCursorLocked}
        isMultiUserActive={isMultiUserActive}
        isPanning={isPanning||panSelected}
        isMoving={isMoving}
        currentTool={currentTool}
        disabledPan={(zoomValue <= HUNDRED_PERCENT && !fitToWidth)}
      >
        {enable && (hasWBAccess || isPresenter) ? editableWB : readOnlyWB}
        <TldrawGlobalStyle
          hideContextMenu={!hasWBAccess && !isPresenter}
          {...{
            hasWBAccess,
            isPresenter,
            size,
            darkTheme,
            isRTL
          }}
        />
      </Cursors>
      {isPresenter && 
        <PanToolInjector
          {...{
            tldrawAPI,
            fitToWidth,
            isPanning,
            setIsPanning,
            zoomValue,
            panSelected,
            setPanSelected,
            currentTool,
          }}
          formatMessage={intl?.formatMessage}
        />
      }
    </>
  );
}
