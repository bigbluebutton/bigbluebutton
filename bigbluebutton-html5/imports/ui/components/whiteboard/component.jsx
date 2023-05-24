import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { TldrawApp, Tldraw } from '@tldraw/tldraw';
import SlideCalcUtil, { HUNDRED_PERCENT } from '/imports/utils/slideCalcUtils';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Utils } from '@tldraw/core';
import Cursors from './cursors/container';
import Settings from '/imports/ui/services/settings';
import logger from '/imports/startup/client/logger';
import KEY_CODES from '/imports/utils/keyCodes';
import {
  presentationMenuHeight,
  styleMenuOffset,
  styleMenuOffsetSmall
} from '/imports/ui/stylesheets/styled-components/general';
import Styled from './styles';
import PanToolInjector from './pan-tool-injector/component';
import {
  findRemoved, filterInvalidShapes, mapLanguage, sendShapeChanges, usePrevious,
} from './utils';

const SMALL_HEIGHT = 435;
const SMALLEST_HEIGHT = 363;
const SMALL_WIDTH = 800;
const SMALLEST_WIDTH = 645;
const TOOLBAR_SMALL = 28;
const TOOLBAR_LARGE = 38;

export default function Whiteboard(props) {
  const {
    isPresenter,
    removeShapes,
    initDefaultPages,
    persistShape,
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
    setTldrawIsMounting,
    width,
    height,
    hasMultiUserAccess,
    tldrawAPI,
    setTldrawAPI,
    whiteboardToolbarAutoHide,
    toggleToolsAnimations,
    isIphone,
    sidebarNavigationWidth,
    animations,
    isToolbarVisible,
  } = props;
  const { pages, pageStates } = initDefaultPages(curPres?.pages.length || 1);
  const rDocument = React.useRef({
    name: 'test',
    version: TldrawApp.version,
    id: whiteboardId,
    pages,
    pageStates,
    bindings: {},
    assets: {},
  });
  const [history, setHistory] = React.useState(null);
  const [zoom, setZoom] = React.useState(HUNDRED_PERCENT);
  const [tldrawZoom, setTldrawZoom] = React.useState(1);
  const [isMounting, setIsMounting] = React.useState(true);
  const prevShapes = usePrevious(shapes);
  const prevSlidePosition = usePrevious(slidePosition);
  const prevFitToWidth = usePrevious(fitToWidth);
  const prevSvgUri = usePrevious(svgUri);
  const language = mapLanguage(Settings?.application?.locale?.toLowerCase() || 'en');
  const [currentTool, setCurrentTool] = React.useState(null);
  const [currentStyle, setCurrentStyle] = React.useState({});
  const [isMoving, setIsMoving] = React.useState(false);
  const [isPanning, setIsPanning] = React.useState(shortcutPanning);
  const [panSelected, setPanSelected] = React.useState(isPanning);
  const isMountedRef = React.useRef(true);
  const [isToolLocked, setIsToolLocked] = React.useState(tldrawAPI?.appState?.isToolLocked);
  const [bgShape, setBgShape] = React.useState(null);

  // eslint-disable-next-line arrow-body-style
  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const setSafeTLDrawAPI = (api) => {
    if (isMountedRef.current) {
      setTldrawAPI(api);
    }
  };

  const toggleOffCheck = (evt) => {
    const clickedElement = evt.target;
    const panBtnClicked = clickedElement?.getAttribute('data-test') === 'panButton'
      || clickedElement?.parentElement?.getAttribute('data-test') === 'panButton';

    setIsToolLocked(false);

    const panButton = document.querySelector('[data-test="panButton"]');
    if (panBtnClicked) {
      const dataZoom = panButton.getAttribute('data-zoom');
      if ((dataZoom <= HUNDRED_PERCENT && !fitToWidth)) {
        return;
      }
      panButton.classList.add('select');
      panButton.classList.remove('selectOverride');
    } else {
      setIsPanning(false);
      setPanSelected(false);
      panButton.classList.add('selectOverride');
      panButton.classList.remove('select');
    }
  };

  React.useEffect(() => {
    const toolbar = document.getElementById('TD-PrimaryTools');
    const handleClick = (evt) => {
      toggleOffCheck(evt);
    };
    const handleDBClick = (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      setIsToolLocked(true);
      tldrawAPI?.patchState(
        {
          appState: {
            isToolLocked: true,
          },
        },
      );
    };
    toolbar?.addEventListener('click', handleClick);
    toolbar?.addEventListener('dblclick', handleDBClick);

    return () => {
      toolbar?.removeEventListener('click', handleClick);
      toolbar?.removeEventListener('dblclick', handleDBClick);
    };
  }, [tldrawAPI, isToolLocked]);

  React.useEffect(() => {
    if (whiteboardToolbarAutoHide) {
      toggleToolsAnimations('fade-in', 'fade-out', animations ? '3s' : '0s');
    } else {
      toggleToolsAnimations('fade-out', 'fade-in', animations ? '.3s' : '0s');
    }
  }, [whiteboardToolbarAutoHide]);
  
  const calculateZoom = (localWidth, localHeight) => {
    const calcedZoom = fitToWidth ? (presentationWidth / localWidth) : Math.min(
      (presentationWidth) / localWidth,
      (presentationHeight) / localHeight,
    );

    return (calcedZoom === 0 || calcedZoom === Infinity) ? HUNDRED_PERCENT : calcedZoom;
  };

  React.useEffect(() => {
    setTldrawIsMounting(true);
  }, []);

  const checkClientBounds = (e) => {
    if (
      e.clientX > document.documentElement.clientWidth
      || e.clientX < 0
      || e.clientY > document.documentElement.clientHeight
      || e.clientY < 0
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

  const handleWheelEvent = (event) => {
    if (!event.ctrlKey) {
      // Prevent the event from reaching the tldraw library
      event.stopPropagation();
      event.preventDefault();
      const newEvent = new WheelEvent('wheel', {
        deltaX: event.deltaX,
        deltaY: event.deltaY,
        deltaZ: event.deltaZ,
        ctrlKey: true,
        clientX: event.clientX,
        clientY: event.clientY,
      });
      const canvas = document.getElementById('canvas');
      if (canvas) {
        canvas.dispatchEvent(newEvent);
      }
    }
  }

  React.useEffect(() => {
    document.addEventListener('mouseup', checkClientBounds);
    document.addEventListener('visibilitychange', checkVisibility);

    return () => {
      document.removeEventListener('mouseup', checkClientBounds);
      document.removeEventListener('visibilitychange', checkVisibility);
      const canvas = document.getElementById('canvas');
      if (canvas) {
        canvas.removeEventListener('wheel', handleWheelEvent);
      }
    };
  }, [tldrawAPI]);

  /* needed to prevent an issue with presentation images not loading correctly in Firefox
  more info: https://github.com/bigbluebutton/bigbluebutton/issues/17969#issuecomment-1561758200 */
  React.useEffect(() => {
    if (bgShape) {
      bgShape.parentElement.style.width = `${bgShape.parentElement.clientWidth + .1}px`;
    }
  }, [bgShape]);

  const doc = React.useMemo(() => {
    const currentDoc = rDocument.current;

    // update document if the number of pages has changed
    if (currentDoc.id !== whiteboardId && currentDoc?.pages.length !== curPres?.pages.length) {
      const currentPageShapes = currentDoc?.pages[curPageId]?.shapes;
      currentDoc.id = whiteboardId;
      currentDoc.pages = pages;
      currentDoc.pages[curPageId].shapes = currentPageShapes;
      currentDoc.pageStates = pageStates;
    }

    const next = { ...currentDoc };

    let changed = false;

    if (next.pageStates[curPageId] && !_.isEqual(prevShapes, shapes)) {
      const editingShape = tldrawAPI?.getShape(tldrawAPI?.getPageState()?.editingId);

      if (editingShape) {
        shapes[editingShape?.id] = editingShape;
      }

      const removed = prevShapes && findRemoved(Object.keys(prevShapes), Object.keys((shapes)));
      if (removed && removed.length > 0) {
        const patchedShapes = Object.fromEntries(removed.map((id) => [id, undefined]));

        try {
          tldrawAPI?.patchState(
            {
              document: {
                pageStates: {
                  [curPageId]: {
                    selectedIds:
                      tldrawAPI?.selectedIds?.filter((id) => !removed.includes(id)) || [],
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

      next.pages[curPageId].shapes = filterInvalidShapes(shapes, curPageId, tldrawAPI);
      changed = true;
    }

    if (curPageId && (!next.assets[`slide-background-asset-${curPageId}`] || (svgUri && !_.isEqual(prevSvgUri, svgUri)))) {
      next.assets[`slide-background-asset-${curPageId}`] = assets[`slide-background-asset-${curPageId}`];
      tldrawAPI?.patchState(
        {
          document: {
            assets,
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
            [curPageId]: { shapes: filterInvalidShapes(shapes, curPageId, tldrawAPI) },
          },
        },
      };
      const prevState = tldrawAPI._state;
      const nextState = Utils.deepMerge(tldrawAPI._state, patch);
      if (nextState.document.pages[curPageId].shapes) {
        filterInvalidShapes(nextState.document.pages[curPageId].shapes, curPageId, tldrawAPI);
      }
      const final = tldrawAPI.cleanup(nextState, prevState, patch, '');
      tldrawAPI._state = final;

      try {
        tldrawAPI?.forceUpdate();
      } catch (error) {
        logger.error({
          logCode: 'whiteboard_shapes_update_error',
          extraInfo: { error },
        }, 'Whiteboard catch error on updating shapes');
      }
    }

    // move poll result text to bottom right
    if (next.pages[curPageId] && slidePosition) {
      const pollResults = Object.entries(next.pages[curPageId].shapes)
        .filter(([, shape]) => shape.name?.includes('poll-result'));
      pollResults.forEach(([id, shape]) => {
        if (_.isEqual(shape.point, [0, 0])) {
          try {
            const shapeBounds = tldrawAPI?.getShapeBounds(id);
            if (shapeBounds) {
              const editedShape = shape;
              editedShape.point = [
                slidePosition.width - shapeBounds.width,
                slidePosition.height - shapeBounds.height,
              ];
              editedShape.size = [shapeBounds.width, shapeBounds.height];
              if (isPresenter) persistShape(editedShape, whiteboardId);
            }
          } catch (error) {
            logger.error({
              logCode: 'whiteboard_poll_results_error',
              extraInfo: { error },
            }, 'Whiteboard catch error on moving unpublished poll results');
          }
        }
      });
    }

    return currentDoc;
  }, [shapes, tldrawAPI, curPageId, slidePosition]);

  // when presentationSizes change, update tldraw camera
  React.useEffect(() => {
    if (curPageId && slidePosition && tldrawAPI
      && presentationWidth > 0 && presentationHeight > 0
    ) {
      if (prevFitToWidth !== null && fitToWidth !== prevFitToWidth) {
        const newZoom = calculateZoom(slidePosition.width, slidePosition.height);
        tldrawAPI?.setCamera([0, 0], newZoom);
        const viewedRegionH = SlideCalcUtil.calcViewedRegionHeight(
          tldrawAPI?.viewport.height, slidePosition.height,
        );
        setZoom(HUNDRED_PERCENT);
        zoomChanger(HUNDRED_PERCENT);
        zoomSlide(parseInt(curPageId, 10), podId, HUNDRED_PERCENT, viewedRegionH, 0, 0);
      } else {
        const currentAspectRatio = Math.round((presentationWidth / presentationHeight) * 100) / 100;
        const previousAspectRatio = Math.round(
          (slidePosition.viewBoxWidth / slidePosition.viewBoxHeight) * 100,
        ) / 100;
        if (fitToWidth && currentAspectRatio !== previousAspectRatio) {
          // we need this to ensure tldraw updates the viewport size after re-mounting
          setTimeout(() => {
            const newZoom = calculateZoom(slidePosition.viewBoxWidth, slidePosition.viewBoxHeight);
            tldrawAPI.setCamera([slidePosition.x, slidePosition.y], newZoom, 'zoomed');
          }, 50);
        } else {
          const newZoom = calculateZoom(slidePosition.viewBoxWidth, slidePosition.viewBoxHeight);
          tldrawAPI?.setCamera([slidePosition.x, slidePosition.y], newZoom);
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
        setTldrawIsMounting(false);
        const currentAspectRatio = Math.round((presentationWidth / presentationHeight) * 100) / 100;
        const previousAspectRatio = Math.round(
          (slidePosition.viewBoxWidth / slidePosition.viewBoxHeight) * 100,
        ) / 100;
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
      const newZoom = prevSlidePosition
        ? calculateZoom(prevSlidePosition.viewBoxWidth, prevSlidePosition.viewBoxHeight)
        : calculateZoom(slidePosition.viewBoxWidth, slidePosition.viewBoxHeight);
      tldrawAPI?.setCamera([slidePosition.x, slidePosition.y], newZoom, 'zoomed_previous_page');
    }
  }, [curPageId]);

  // change tldraw camera when slidePosition changes
  React.useEffect(() => {
    if (tldrawAPI && !isPresenter && curPageId && slidePosition) {
      const newZoom = calculateZoom(slidePosition.viewBoxWidth, slidePosition.viewBoxHeight);
      tldrawAPI?.setCamera([slidePosition.x, slidePosition.y], newZoom, 'zoomed');
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
  }, [zoomValue]);

  // update zoom when presenter changes if the aspectRatio has changed
  React.useEffect(() => {
    if (tldrawAPI && isPresenter && curPageId && slidePosition && !isMounting) {
      const currentAspectRatio = Math.round((presentationWidth / presentationHeight) * 100) / 100;
      const previousAspectRatio = Math.round(
        (slidePosition.viewBoxWidth / slidePosition.viewBoxHeight) * 100,
      ) / 100;
      if (previousAspectRatio !== currentAspectRatio) {
        if (fitToWidth) {
          const newZoom = calculateZoom(slidePosition.width, slidePosition.height);
          tldrawAPI?.setCamera([0, 0], newZoom);
          const viewedRegionH = SlideCalcUtil.calcViewedRegionHeight(
            tldrawAPI?.viewport.height, slidePosition.height,
          );
          zoomSlide(parseInt(curPageId, 10), podId, HUNDRED_PERCENT, viewedRegionH, 0, 0);
          setZoom(HUNDRED_PERCENT);
          zoomChanger(HUNDRED_PERCENT);
        } else if (!isMounting) {
          let viewedRegionW = SlideCalcUtil.calcViewedRegionWidth(
            tldrawAPI?.viewport.width, slidePosition.width,
          );
          let viewedRegionH = SlideCalcUtil.calcViewedRegionHeight(
            tldrawAPI?.viewport.height, slidePosition.height,
          );
          const camera = tldrawAPI?.getPageState()?.camera;
          const zoomFitSlide = calculateZoom(slidePosition.width, slidePosition.height);
          if (!fitToWidth && camera.zoom === zoomFitSlide) {
            viewedRegionW = HUNDRED_PERCENT;
            viewedRegionH = HUNDRED_PERCENT;
          }
          zoomSlide(
            parseInt(curPageId, 10),
            podId,
            viewedRegionW,
            viewedRegionH,
            camera.point[0],
            camera.point[1],
          );
          const zoomToolbar = Math.round(
            ((HUNDRED_PERCENT * camera.zoom) / zoomFitSlide) * 100,
          ) / 100;
          if (zoom !== zoomToolbar) {
            setZoom(zoomToolbar);
            zoomChanger(zoomToolbar);
          }
        }
      }
    }
  }, [isPresenter]);

  const hasWBAccess = hasMultiUserAccess(whiteboardId, currentUser.userId);

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
      setHistory(null);
      tldrawAPI.resetHistory();
    }
  }, [curPres?.id]);

  React.useEffect(() => {
    const currentZoom = tldrawAPI?.getPageState()?.camera?.zoom;
    if (currentZoom !== tldrawZoom) {
      setTldrawZoom(currentZoom);
    }
    setBgShape(null);
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
  };

  const nextSlideHandler = (event) => {
    const { nextSlide, numberOfSlides } = props;

    if (event) event.currentTarget.blur();
    nextSlide(+curPageId, numberOfSlides, podId);
  };

  const previousSlideHandler = (event) => {
    const { previousSlide } = props;

    if (event) event.currentTarget.blur();
    previousSlide(+curPageId, podId);
  };

  const handleOnKeyDown = (event) => {
    const { which, ctrlKey } = event;

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
      case KEY_CODES.A:
        if (ctrlKey) {
          event.preventDefault();
          event.stopPropagation();
          tldrawAPI?.selectAll();
        }
        break;
      default:
    }
  };

  const onMount = (app) => {
    const menu = document.getElementById('TD-Styles')?.parentElement;
    const canvas = document.getElementById('canvas');
    if (canvas) {
      canvas.addEventListener('wheel', handleWheelEvent, { capture: true });
    }

    if (menu) {
      const MENU_OFFSET = '48px';
      menu.style.position = 'relative';
      menu.style.height = presentationMenuHeight;
      menu.setAttribute('id', 'TD-Styles-Parent');
      if (isRTL) {
        menu.style.left = MENU_OFFSET;
      } else {
        menu.style.right = MENU_OFFSET;
      }

      [...menu.children]
        .sort((a, b) => (a?.id > b?.id ? -1 : 1))
        .forEach((n) => menu.appendChild(n));
    }

    app.setSetting('language', language);
    app?.setSetting('isDarkMode', false);

    const textAlign = isRTL ? 'end' : 'start';

    app?.patchState(
      {
        appState: {
          currentStyle: {
            textAlign: currentStyle?.textAlign || textAlign,
            font: currentStyle?.font || fontFamily,
          },
        },
      },
    );

    setSafeTLDrawAPI(app);
    // disable for non presenter that doesn't have multi user access
    if (!hasWBAccess && !isPresenter) {
      const newApp = app;
      newApp.onPan = () => { };
      newApp.setSelectedIds = () => { };
      newApp.setHoveredId = () => { };
    }

    if (history) {
      app.replaceHistory(history);
    }

    if (curPageId) {
      app.patchState(
        {
         appState: {
            currentPageId: curPageId,
          },
        },
      );
      setIsMounting(true);
    }
      
  };

  const onPatch = (e, t, reason) => {
    if (!e?.pageState || !reason) return;
    if (((isPanning || panSelected) && (reason === 'selected' || reason === 'set_hovered_id'))) {
      e.patchState(
        {
          document: {
            pageStates: {
              [e.getPage()?.id]: {
                selectedIds: [],
                hoveredId: null,
              },
            },
          },
        },
      );
      return;
    }

    // don't allow select others shapes for editing if don't have permission
    if (reason && reason.includes('set_editing_id')) {
      if (!hasShapeAccess(e.pageState.editingId)) {
        e.pageState.editingId = null;
      }
    }
    // don't allow hover others shapes for editing if don't have permission
    if (reason && reason.includes('set_hovered_id')) {
      if (!hasShapeAccess(e.pageState.hoveredId)) {
        e.pageState.hoveredId = null;
      }
    }
    // don't allow select others shapes if don't have permission
    if (reason && reason.includes('selected')) {
      const validIds = [];
      e.pageState.selectedIds.forEach((id) => hasShapeAccess(id) && validIds.push(id));
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
        },
      );
    }
    // don't allow selecting others shapes with ctrl (brush)
    if (e?.session?.type === 'brush' && e?.session?.status === 'brushing') {
      const validIds = [];
      e.pageState.selectedIds.forEach((id) => hasShapeAccess(id) && validIds.push(id));
      e.pageState.selectedIds = validIds;
      if (!validIds.find((id) => id === e.pageState.hoveredId)) {
        e.pageState.hoveredId = undefined;
      }
    }

    // change cursor when moving shapes
    if (e?.session?.type === 'translate' && e?.session?.status === 'translating') {
      if (!isMoving) setIsMoving(true);
      if (reason === 'set_status:idle') setIsMoving(false);
    }

    if (reason && isPresenter && slidePosition && (reason.includes('zoomed') || reason.includes('panned'))) {
      const camera = tldrawAPI?.getPageState()?.camera;

      // limit bounds
      if (tldrawAPI?.viewport.maxX > slidePosition.width) {
        camera.point[0] += (tldrawAPI?.viewport.maxX - slidePosition.width);
      }
      if (tldrawAPI?.viewport.maxY > slidePosition.height) {
        camera.point[1] += (tldrawAPI?.viewport.maxY - slidePosition.height);
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

      const zoomToolbar = Math.round(((HUNDRED_PERCENT * camera.zoom) / zoomFitSlide) * 100) / 100;
      if (zoom !== zoomToolbar) {
        setZoom(zoomToolbar);
        if (isPresenter) zoomChanger(zoomToolbar);
      }

      let viewedRegionW = SlideCalcUtil.calcViewedRegionWidth(
        tldrawAPI?.viewport.width, slidePosition.width,
      );
      let viewedRegionH = SlideCalcUtil.calcViewedRegionHeight(
        tldrawAPI?.viewport.height, slidePosition.height,
      );

      if (!fitToWidth && camera.zoom === zoomFitSlide) {
        viewedRegionW = HUNDRED_PERCENT;
        viewedRegionH = HUNDRED_PERCENT;
      }

      zoomSlide(
        parseInt(curPageId, 10),
        podId,
        viewedRegionW,
        viewedRegionH,
        camera.point[0],
        camera.point[1],
      );
    }
    // don't allow non-presenters to pan&zoom
    if (slidePosition && reason && !isPresenter && (reason.includes('zoomed') || reason.includes('panned'))) {
      const newZoom = calculateZoom(slidePosition.viewBoxWidth, slidePosition.viewBoxHeight);
      tldrawAPI?.setCamera([slidePosition.x, slidePosition.y], newZoom);
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

    if (reason && reason.includes('ui:toggled_is_loading')) {
      e?.patchState(
        {
          appState: {
            currentStyle,
          },
        },
      );
    }

    e?.patchState(
      {
        appState: {
          isToolLocked,
        },
      },
    );

    if ((panSelected || isPanning)) {
      e.isForcePanning = isPanning;
    }
  };

  const onUndo = (app) => {
    if (app.currentPageId !== curPageId) {
      if (isPresenter) {
        // change slide for others
        skipToSlide(Number.parseInt(app.currentPageId, 10), podId);
      } else {
        // ignore, stay on same page
        app.changePage(curPageId);
      }
      return;
    }
    const lastCommand = app.stack[app.pointer + 1];
    const changedShapes = lastCommand?.before?.document?.pages[app.currentPageId]?.shapes;
    if (changedShapes) {
      sendShapeChanges(
        app, changedShapes, shapes, prevShapes, hasShapeAccess,
        whiteboardId, currentUser, intl, true,
      );
    }
  };

  const onRedo = (app) => {
    if (app.currentPageId !== curPageId) {
      if (isPresenter) {
        // change slide for others
        skipToSlide(Number.parseInt(app.currentPageId, 10), podId);
      } else {
        // ignore, stay on same page
        app.changePage(curPageId);
      }
      return;
    }
    const lastCommand = app.stack[app.pointer];
    const changedShapes = lastCommand?.after?.document?.pages[app.currentPageId]?.shapes;
    if (changedShapes) {
      sendShapeChanges(
        app, changedShapes, shapes, prevShapes, hasShapeAccess, whiteboardId, currentUser, intl,
      );
    }
  };

  const onCommand = (app, command) => {
    const isFirstCommand = command.id === "change_page" && command.before?.appState.currentPageId === "0";
    if (!isFirstCommand){
      setHistory(app.history);
    }

    if (whiteboardToolbarAutoHide && command && command.id === "change_page") {
      toggleToolsAnimations('fade-in', 'fade-out', '0s');
    }

    if (command?.id?.includes('style')) {
      setCurrentStyle({ ...currentStyle, ...command?.after?.appState?.currentStyle });
    }

    const changedShapes = command.after?.document?.pages[app.currentPageId]?.shapes;
    if (!isMounting && app.currentPageId !== curPageId) {
      // can happen then the "move to page action" is called, or using undo after changing a page
      const currentPage = curPres.pages.find(
        (page) => page.num === Number.parseInt(app.currentPageId, 10),
      );
      if (!currentPage) return;
      const newWhiteboardId = currentPage.id;
      // remove from previous page and persist on new
      if (changedShapes) {
        removeShapes(Object.keys(changedShapes), whiteboardId);
        Object.entries(changedShapes)
          .forEach(([id, shape]) => {
            const shapeBounds = app.getShapeBounds(id);
            const editedShape = shape;
            editedShape.size = [shapeBounds.width, shapeBounds.height];
            persistShape(editedShape, newWhiteboardId);
          });
      }
      if (isPresenter) {
        // change slide for others
        skipToSlide(Number.parseInt(app.currentPageId, 10), podId);
      } else {
        // ignore, stay on same page
        app.changePage(curPageId);
      }
    } else if (changedShapes) {
      sendShapeChanges(
        app, changedShapes, shapes, prevShapes, hasShapeAccess, whiteboardId, currentUser, intl,
      );
    }
  };

  const webcams = document.getElementById('cameraDock');
  const dockPos = webcams?.getAttribute('data-position');
  const backgroundShape = document.getElementById('slide-background-shape_image');

  if (currentTool && !isPanning && !tldrawAPI?.isForcePanning) tldrawAPI?.selectTool(currentTool);

  if (backgroundShape?.src && backgroundShape?.complete && backgroundShape?.src !== bgShape?.src) {
    setBgShape(backgroundShape);
  }
  const editableWB = (
    <Styled.EditableWBWrapper onKeyDown={handleOnKeyDown}>
      <Tldraw
        key={`wb-${isRTL}-${dockPos}-${presentationAreaHeight}-${presentationAreaWidth}-${sidebarNavigationWidth}`}
        document={doc}
        // disable the ability to drag and drop files onto the whiteboard
        // until we handle saving of assets in akka.
        disableAssets
        // Disable automatic focus. Users were losing focus on shared notes
        // and chat on presentation mount.
        autofocus={false}
        onMount={onMount}
        showPages={false}
        showZoom={false}
        showUI={curPres ? (isPresenter || hasWBAccess) : true}
        showMenu={!curPres}
        showMultiplayerMenu={false}
        readOnly={false}
        onPatch={onPatch}
        onUndo={onUndo}
        onRedo={onRedo}
        onCommand={onCommand}
      />
    </Styled.EditableWBWrapper>
  );

  const readOnlyWB = (
    <Tldraw
      key="wb-readOnly"
      document={doc}
      onMount={onMount}
      // disable the ability to drag and drop files onto the whiteboard
      // until we handle saving of assets in akka.
      disableAssets
      // Disable automatic focus. Users were losing focus on shared notes
      // and chat on presentation mount.
      autofocus={false}
      showPages={false}
      showZoom={false}
      showUI={false}
      showMenu={false}
      showMultiplayerMenu={false}
      readOnly
      onPatch={onPatch}
    />
  );

  const size = ((height < SMALL_HEIGHT) || (width < SMALL_WIDTH))
    ? TOOLBAR_SMALL : TOOLBAR_LARGE;

  if (hasWBAccess || isPresenter) {
    if (((height < SMALLEST_HEIGHT) || (width < SMALLEST_WIDTH))) {
      tldrawAPI?.setSetting('dockPosition', 'bottom');
    } else {
      tldrawAPI?.setSetting('dockPosition', isRTL ? 'left' : 'right');
    }
  }

  const menuOffsetValues = {
    true: {
      true: `${styleMenuOffsetSmall}`,
      false: `${styleMenuOffset}`,
    },
    false: {
      true: `-${styleMenuOffsetSmall}`,
      false: `-${styleMenuOffset}`,
    },
  };

  const menuOffset = menuOffsetValues[isRTL][isIphone];

  return (
    <div key={`animations=-${animations}`}>
      <Cursors
        tldrawAPI={tldrawAPI}
        currentUser={currentUser}
        hasMultiUserAccess={hasMultiUserAccess}
        whiteboardId={whiteboardId}
        isViewersCursorLocked={isViewersCursorLocked}
        isMultiUserActive={isMultiUserActive}
        isPanning={isPanning || panSelected}
        isMoving={isMoving}
        currentTool={currentTool}
        whiteboardToolbarAutoHide={whiteboardToolbarAutoHide}
        toggleToolsAnimations={toggleToolsAnimations}
      >
        {(hasWBAccess || isPresenter) ? editableWB : readOnlyWB}
        <Styled.TldrawGlobalStyle
          hideContextMenu={!hasWBAccess && !isPresenter}
          {...{
            hasWBAccess,
            isPresenter,
            size,
            darkTheme,
            menuOffset,
            panSelected,
            isToolbarVisible,
          }}
        />
      </Cursors>
      {isPresenter && (
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
      )}
    </div>
  );
}

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
  curPres: PropTypes.shape({
    pages: PropTypes.arrayOf(PropTypes.shape({})),
    id: PropTypes.string.isRequired,
  }),
  whiteboardId: PropTypes.string,
  podId: PropTypes.string.isRequired,
  zoomSlide: PropTypes.func.isRequired,
  skipToSlide: PropTypes.func.isRequired,
  slidePosition: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    viewBoxWidth: PropTypes.number.isRequired,
    viewBoxHeight: PropTypes.number.isRequired,
  }),
  curPageId: PropTypes.string.isRequired,
  presentationWidth: PropTypes.number.isRequired,
  presentationHeight: PropTypes.number.isRequired,
  isViewersCursorLocked: PropTypes.bool.isRequired,
  zoomChanger: PropTypes.func.isRequired,
  isMultiUserActive: PropTypes.func.isRequired,
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
  isPanning: PropTypes.bool.isRequired,
  setTldrawIsMounting: PropTypes.func.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  hasMultiUserAccess: PropTypes.func.isRequired,
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
};

Whiteboard.defaultProps = {
  curPres: undefined,
  fullscreenRef: undefined,
  slidePosition: undefined,
  svgUri: undefined,
  whiteboardId: undefined,
  sidebarNavigationWidth: 0,
};
