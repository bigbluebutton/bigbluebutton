import * as React from "react";
import _ from "lodash";
import { createGlobalStyle } from "styled-components";
import Cursors from "./cursors/container";
import { TldrawApp, Tldraw } from "@tldraw/tldraw";
import {
  ColorStyle,
  DashStyle,
  SizeStyle,
  TDShapeType,
} from "@tldraw/tldraw";
import SlideCalcUtil, {HUNDRED_PERCENT} from '/imports/utils/slideCalcUtils';

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

const SMALL_HEIGHT = 435;
const SMALLEST_HEIGHT = 363;
const TOOLBAR_SMALL = 28;
const TOOLBAR_LARGE = 38;

const TldrawGlobalStyle = createGlobalStyle`
  ${({ hideContextMenu }) => hideContextMenu && `
    #TD-ContextMenu {
      display: none;
    }
  `}
`;

export default function Whiteboard(props) {
  const {
    isPresenter,
    removeShapes,
    initDefaultPages,
    persistShape,
    shapes,
    currentUser,
    curPres,
    whiteboardId,
    podId,
    zoomSlide,
    skipToSlide,
    slidePosition,
    curPageId,
    svgUri,
    presentationWidth,
    presentationHeight,
    isViewersCursorLocked,
    zoomChanger,
    isMultiUserActive,
    isRTL,
    fitToWidth,
    zoomValue,
    width,
    height,
    isPanning,
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
  const [forcePanning, setForcePanning] = React.useState(false);
  const [zoom, setZoom] = React.useState(HUNDRED_PERCENT);
  const [isMounting, setIsMounting] = React.useState(true);
  const prevShapes = usePrevious(shapes);
  const prevSlidePosition = usePrevious(slidePosition);
  const prevFitToWidth = usePrevious(fitToWidth);

  const calculateZoom = (width, height) => {
    let zoom = fitToWidth 
      ? presentationWidth / width
      : Math.min(
          (presentationWidth) / width,
          (presentationHeight) / height
        );

    return zoom;
  }

  const doc = React.useMemo(() => {
    const currentDoc = rDocument.current;

    let next = { ...currentDoc };

    let pageBindings = null;
    let history = null;
    let stack = null;
    let changed = false;

    if (next.pageStates[curPageId] && !_.isEqual(prevShapes, shapes)) {
      // mergeDocument loses bindings and history, save it
      pageBindings = tldrawAPI?.getPage(curPageId)?.bindings;
      history = tldrawAPI?.history
      stack = tldrawAPI?.stack

      next.pages[curPageId].shapes = shapes;

      changed = true;
    }

    if (curPageId && next.pages[curPageId] && !next.pages[curPageId].shapes["slide-background-shape"]) {
      next.assets[`slide-background-asset-${curPageId}`] = {
        id: `slide-background-asset-${curPageId}`,
        size: [slidePosition?.width || 0, slidePosition?.height || 0],
        src: svgUri,
        type: "image",
      };

      next.pages[curPageId].shapes["slide-background-shape"] = {
        assetId: `slide-background-asset-${curPageId}`,
        childIndex: 0.5,
        id: "slide-background-shape",
        name: "Image",
        type: TDShapeType.Image,
        parentId: `${curPageId}`,
        point: [0, 0],
        isLocked: true,
        size: [slidePosition?.width || 0, slidePosition?.height || 0],
        style: {
          dash: DashStyle.Draw,
          size: SizeStyle.Medium,
          color: ColorStyle.Blue,
        },
      };

      changed = true;
    }

    if (changed) {
      if (pageBindings) next.pages[curPageId].bindings = pageBindings;
      tldrawAPI?.mergeDocument(next);
      if (tldrawAPI && history) tldrawAPI.history = history;
      if (tldrawAPI && stack) tldrawAPI.stack = stack;
    }

    // move poll result text to bottom right
    if (next.pages[curPageId]) {
      const pollResults = Object.entries(next.pages[curPageId].shapes)
                                .filter(([id, shape]) => shape.name.includes("poll-result"))
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
    if (curPageId && slidePosition && tldrawAPI && presentationWidth !== 0 && presentationHeight !== 0) {
      if (prevFitToWidth !== null && fitToWidth !== prevFitToWidth) {
        const zoom = calculateZoom(slidePosition.width, slidePosition.height)
        tldrawAPI?.setCamera([0, 0], zoom);
        const viewedRegionH = SlideCalcUtil.calcViewedRegionHeight(tldrawAPI?.viewport.width, slidePosition.height);
        zoomSlide(parseInt(curPageId), podId, HUNDRED_PERCENT, viewedRegionH, 0, 0);
      } else {
        const currentAspectRatio =  Math.round((presentationWidth / presentationHeight) * 100) / 100;
        const previousAspectRatio = Math.round((slidePosition.viewBoxWidth / slidePosition.viewBoxHeight) * 100) / 100;
        if (isMounting && currentAspectRatio !== previousAspectRatio) {
          // wee need this to ensure tldraw updates the viewport size
          // after re-mounting
          setTimeout(() => {
            const zoom = calculateZoom(slidePosition.viewBoxWidth, slidePosition.viewBoxHeight);
            tldrawAPI.setCamera([slidePosition.x, slidePosition.y], zoom, 'zoomed');
            setIsMounting(false);
          }, 50);
        } else {
          const zoom = calculateZoom(slidePosition.viewBoxWidth, slidePosition.viewBoxHeight);
          tldrawAPI?.setCamera([slidePosition.x, slidePosition.y], zoom);
        }
      }
    }
  }, [presentationWidth, presentationHeight, curPageId, document?.documentElement?.dir]);

  // change tldraw page when presentation page changes
  React.useEffect(() => {
    if (tldrawAPI && curPageId) {
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
      tldrawAPI?.zoomTo(zoomCamera);
    }
  }, [zoomValue]);

  // update zoom when presenter changes
  React.useEffect(() => {
    if (tldrawAPI && isPresenter && curPageId && slidePosition) {
      const currentAspectRatio =  Math.round((presentationWidth / presentationHeight) * 100) / 100;
      const previousAspectRatio = Math.round((slidePosition.viewBoxWidth / slidePosition.viewBoxHeight) * 100) / 100;
      if (previousAspectRatio !== currentAspectRatio && fitToWidth) {
        const zoom = calculateZoom(slidePosition.width, slidePosition.height)
        tldrawAPI?.setCamera([0, 0], zoom);
        const viewedRegionH = SlideCalcUtil.calcViewedRegionHeight(tldrawAPI?.viewport.width, slidePosition.height);
        zoomSlide(parseInt(curPageId), podId, HUNDRED_PERCENT, viewedRegionH, 0, 0);
      } else {
        const zoom = calculateZoom(slidePosition.viewBoxWidth, slidePosition.viewBoxHeight)
        tldrawAPI.setCamera([slidePosition.x, slidePosition.y], zoom, 'zoomed');
      }
    }
  }, [isPresenter]);

  const hasWBAccess = props?.hasMultiUserAccess(props.whiteboardId, props.currentUser.userId);

  React.useEffect(() => {
    if (hasWBAccess || isPresenter) {
      tldrawAPI?.setSetting('dockPosition', isRTL ? 'left' : 'right');
      const tdToolsDots = document.getElementById("TD-Tools-Dots");
      const tdDelete = document.getElementById("TD-Delete");
      const tdPrimaryTools = document.getElementById("TD-PrimaryTools");
      const tdTools = document.getElementById("TD-Tools");
      if (tdToolsDots && tdDelete && tdPrimaryTools) {
        const size = props.height < SMALL_HEIGHT ? TOOLBAR_SMALL : TOOLBAR_LARGE;
        tdToolsDots.style.height = `${size}px`;
        tdToolsDots.style.width = `${size}px`;
        const delButton = tdDelete.getElementsByTagName('button')[0];
        delButton.style.height = `${size}px`;
        delButton.style.width = `${size}px`;
        const primaryBtns = tdPrimaryTools?.getElementsByTagName('button');
        for (let item of primaryBtns) {
          item.style.height = `${size}px`;
          item.style.width = `${size}px`;
        }
      }
      if (props.height < SMALLEST_HEIGHT && tdTools) {
        tldrawAPI?.setSetting('dockPosition', 'bottom');
        tdTools.parentElement.style.bottom = `${TOOLBAR_SMALL}px`;
      }
      // removes tldraw native help menu button
      tdTools?.parentElement?.nextSibling?.remove();
      // removes image tool from the tldraw toolbar
      document.getElementById("TD-PrimaryTools-Image").style.display = 'none';
    }

    if (tldrawAPI) {
      tldrawAPI.isForcePanning = isPanning;
    }
  });

  React.useEffect(() => {
    if (tldrawAPI) {
      tldrawAPI.isForcePanning = isPanning;
    }
  }, [isPanning]);

  const onMount = (app) => {
    app.setSetting('language', document.getElementsByTagName('html')[0]?.lang || 'en');
    setTLDrawAPI(app);
    props.setTldrawAPI(app);
    // disable for non presenter that doesn't have multi user access
    if (!hasWBAccess && !isPresenter) {
      app.onPan = () => {};
      app.setSelectedIds = () => {};
      app.setHoveredId = () => {};
    } else {
      // disable hover highlight for background slide shape
      app.setHoveredId = (id) => {
        if (id?.includes('slide-background')) return null;
        app.patchState(
          {
            document: {
              pageStates: {
                [app.getPage()?.id]: {
                  hoveredId: id || [],
                },
              },
            },
          },
          `set_hovered_id`
        );
      };
    }

    if (curPageId) {
      app.changePage(curPageId);
      if (presentationWidth > 0 && presentationHeight > 0) {
        const zoom = calculateZoom(slidePosition.viewBoxWidth, slidePosition.viewBoxHeight);
        // wee need this to ensure tldraw updates the viewport size
        // after re-mounting
        setTimeout(() => {
          app.setCamera([slidePosition.x, slidePosition.y], zoom, 'zoomed');
          setIsMounting(false);
        }, 50);
      }
    }
  };

  const onPatch = (e, t, reason) => {
    if (reason && isPresenter && (reason.includes("zoomed") || reason.includes("panned"))) {
      const camera = tldrawAPI.getPageState()?.camera;

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

      let viewedRegionW = SlideCalcUtil.calcViewedRegionWidth(tldrawAPI?.viewport.height, slidePosition.width);
      let viewedRegionH = SlideCalcUtil.calcViewedRegionHeight(tldrawAPI?.viewport.width, slidePosition.height);

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
  };

  // this callback is called whenever the shapes on the page are changed by the user,
  // with what changed stored in changedShapes
  const onChangePage = (app, changedShapes) => { 
    if (isPresenter || hasWBAccess) {
      if (app.currentPageId !== curPageId) {
        // can happen then the "move to page action" is called, or using undo after changing a page
        const newWhiteboardId = curPres.pages.find(page => page.num === Number.parseInt(app.currentPageId)).id;
        //remove from previous page and persist on new
        removeShapes(Object.keys(changedShapes), whiteboardId);
        Object.entries(changedShapes)
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
      } else {          
        let deletedShapes = [];
        Object.entries(changedShapes)
              .forEach(([id, shape]) => {
                if (!shape) deletedShapes.push(id);
                else {
                  const shapeBounds = app.getShapeBounds(id);
                  shape.size = [shapeBounds.width, shapeBounds.height];
                  persistShape(shape, whiteboardId);
                }
              });
        removeShapes(deletedShapes, whiteboardId);
      }
    }
  };

  const webcams = document.getElementById('cameraDock');
  const dockPos = webcams?.getAttribute("data-position");
  const editableWB = (
    <Tldraw
      key={`wb-${isRTL}-${width}-${height}-${dockPos}-${forcePanning}`}
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
      onChangePage={onChangePage}
    />
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

  return (
    <>
      <Cursors
        tldrawAPI={tldrawAPI}
        currentUser={currentUser}
        hasMultiUserAccess={props?.hasMultiUserAccess}
        whiteboardId={whiteboardId}
        isViewersCursorLocked={isViewersCursorLocked}
        isMultiUserActive={isMultiUserActive}
        isPanning={isPanning}
      >
        {hasWBAccess || isPresenter ? editableWB : readOnlyWB}
        <TldrawGlobalStyle hideContextMenu={!hasWBAccess && !isPresenter} />
      </Cursors>
    </>
  );
}
