import * as React from "react";
import _ from "lodash";
import Cursors from "./cursors/container";
import { TldrawApp, Tldraw } from "@tldraw/tldraw";
import logger from '/imports/startup/client/logger';
import {
  ColorStyle,
  DashStyle,
  SizeStyle,
  TDDocument,
  TDShapeType,
} from "@tldraw/tldraw";
import { Renderer, Utils } from "@tldraw/core";

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

export default function Whiteboard(props) {
  const {
    isPresenter,
    removeShapes,
    initDefaultPages,
    meetingId,
    persistShape,
    persistAsset,
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
    svgUri,
    presentationBounds,
    isViewersCursorLocked,
  } = props;

  const { pages, pageStates } = initDefaultPages(curPres?.pages.length || 1);
  const rDocument = React.useRef({
    name: "test",
    version: TldrawApp.version,
    id: whiteboardId,
    pages,
    pageStates,
    bindings: {},
    assets,
  });
  //const [doc, setDoc] = React.useState(rDocument.current);
  const [_assets, setAssets] = React.useState(assets);
  const [command, setCommand] = React.useState("");
  const [wbAccess, setWBAccess] = React.useState(props?.hasMultiUserAccess(props.whiteboardId, props.currentUser.userId));
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [tldrawAPI, setTLDrawAPI] = React.useState(null);
  const [cameraFitSlide, setCameraFitSlide] = React.useState({point: [0, 0], zoom: 0});
  const [zoomedIn, setZoomedIn] = React.useState(false);
  const prevShapes = usePrevious(shapes);
  const prevSlidePosition = usePrevious(slidePosition);
  const prevPageId = usePrevious(curPageId);

  const calculateCameraFitSlide = () => {
    let zoom = 
      Math.min(
        (presentationBounds.width) / slidePosition.width,
        (presentationBounds.height) / slidePosition.height
      )        
      
    zoom = Utils.clamp(zoom, 0.1, 5);

    let point = [0, 0];
    if ((presentationBounds.width / presentationBounds.height) > 
        (slidePosition.width / slidePosition.height)) 
    { 
      point[0] = (presentationBounds.width - (slidePosition.width * zoom)) / 2 / zoom
    } else {
      point[1] = (presentationBounds.height - (slidePosition.height * zoom)) / 2 / zoom
    }

    return {point, zoom}
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

    if (next.pages[curPageId] && !next.pages[curPageId].shapes["slide-background-shape"]) {      
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
  }, [assets, shapes, tldrawAPI, curPageId, slidePosition]);

  // when presentationBounds change, update tldraw camera
  // to fit slide on center if zoomed out
  React.useEffect(() => {
    if (curPageId && slidePosition) {
      const camera = calculateCameraFitSlide();
      setCameraFitSlide(camera);
      if (!zoomedIn) {
        tldrawAPI?.setCamera(camera.point, camera.zoom);
      }
    }
  }, [presentationBounds, curPageId]);

  // change tldraw page when presentation page changes
  React.useEffect(() => {
    if (tldrawAPI && curPageId) {
      const previousPageZoom = tldrawAPI.getPageState()?.camera?.zoom;
      tldrawAPI.changePage(curPageId);
      //change zoom of the new page to follow the previous one
      if (!zoomedIn && cameraFitSlide.zoom !== 0) {
        tldrawAPI?.setCamera(cameraFitSlide.point, cameraFitSlide.zoom, "zoomed");
      } else {
        previousPageZoom &&
        slidePosition && 
        tldrawAPI.setCamera([slidePosition.xCamera, slidePosition.yCamera], previousPageZoom, "zoomed");
      }
    }
  }, [curPageId]);

  // change tldraw camera when slidePosition changes
  React.useEffect(() => {
    if (tldrawAPI && !isPresenter && curPageId && slidePosition) {
      if (slidePosition.zoom === 0 && slidePosition.xCamera === 0 && slidePosition.yCamera === 0) {
        tldrawAPI?.setCamera(cameraFitSlide.point, cameraFitSlide.zoom);
        setZoomedIn(false);
      } else {
        tldrawAPI?.setCamera([slidePosition.xCamera, slidePosition.yCamera], slidePosition.zoom);
        setZoomedIn(true);
      }
    }
  }, [curPageId, slidePosition]);

  const hasWBAccess = props?.hasMultiUserAccess(props.whiteboardId, props.currentUser.userId);

  return (
    <>
      <Cursors
        tldrawAPI={tldrawAPI}
        currentUser={currentUser}
        whiteboardId={whiteboardId}
        isViewersCursorLocked={isViewersCursorLocked}
      >
        <Tldraw
          key={`wb-${!hasWBAccess && !isPresenter}`}
          document={doc}
          disableAssets={false}
          onMount={(app) => {
            if (!hasWBAccess && !isPresenter) app.onPan = () => {}; 
            setTLDrawAPI(app);
            props.setTldrawAPI(app);
            if (curPageId) {
              app.changePage(curPageId);
              if (slidePosition.zoom === 0) {
                // first load, center the view to fit slide
                const cameraFitSlide = calculateCameraFitSlide();
                app.setCamera(cameraFitSlide.point, cameraFitSlide.zoom);
                setCameraFitSlide(cameraFitSlide);
              } else {
                app.setCamera([slidePosition.xCamera, slidePosition.yCamera], slidePosition.zoom)
                setZoomedIn(true);
              }
            }
          }}
          showPages={false}
          showZoom={false}
          showUI={curPres ? (isPresenter || hasWBAccess) : true}
          showMenu={curPres ? false : true}
          showMultiplayerMenu={false}
          readOnly={!isPresenter && !hasWBAccess}
          onUndo={(e, s) => {
            e?.selectedIds?.map(id => {
              persistShape(e.getShape(id), whiteboardId);
            })
            const pageShapes = e.state.document.pages[e.getPage()?.id]?.shapes;
            let shapesIdsToRemove = findRemoved(Object.keys(shapes), Object.keys(pageShapes))
            removeShapes(shapesIdsToRemove, whiteboardId)
          }}

          onRedo={(e, s) => {
            e?.selectedIds?.map(id => {
              persistShape(e.getShape(id), whiteboardId);
            });
            const pageShapes = e.state.document.pages[e.getPage()?.id]?.shapes;
            let shapesIdsToRemove = findRemoved(Object.keys(shapes), Object.keys(pageShapes))
            removeShapes(shapesIdsToRemove, whiteboardId)
          }}

          onChangePage={(app, s, b, a) => {
            if (app.getPage()?.id !== curPageId) {
              skipToSlide(Number.parseInt(app.getPage()?.id), podId)
            }
          }}
          onCommand={(e, s, g) => {
            if (s.includes("session:complete:DrawSession")) {
              Object.entries(e.state.document.pages[e.getPage()?.id]?.shapes)
                .filter(([k, s]) => s?.type === 'draw')
                .forEach(([k, s]) => {
                  if (!e.prevShapes[k] && !k.includes('slide-background')) {
                    const shapeBounds = e.getShapeBounds(k);
                    s.size = [shapeBounds.width, shapeBounds.height];
                    persistShape(s, whiteboardId);
                  }
                });
            }

            if (s.includes("style")
            || s?.includes("session:complete:ArrowSession")) {
              e.selectedIds.forEach(id => {
                const shape = e.getShape(id);
                const shapeBounds = e.getShapeBounds(id);
                shape.size = [shapeBounds.width, shapeBounds.height];
                persistShape(shape, whiteboardId);
              }); 
            }

            if (s.includes('move_to_page')) {
              const movedShapes = e.selectedIds.map(id => {
                return e.getShape(id);
              });
              //remove shapes on origin page
              removeShapes(e.selectedIds, whiteboardId);
              //persist shapes for destination page
              const newWhiteboardId = curPres.pages.find(page => page.num === Number.parseInt(e.getPage()?.id)).id;
              movedShapes.forEach(s => {
                persistShape(s, newWhiteboardId);
              });
              return;
            }

            const conditions = [
              "session:complete:TransformSingleSession", "session:complete:TranslateSession",
              "session:complete:RotateSession", "session:complete:HandleSession", 
              "updated_shapes", "duplicate", "stretch", "align", "move", 
              "create", "flip", "toggle", "group", "translate"
            ]
            if (conditions.some(el => s?.includes(el))) {
                e.selectedIds.forEach(id => {
                  const shape = e.getShape(id);
                  const shapeBounds = e.getShapeBounds(id);
                  shape.size = [shapeBounds.width, shapeBounds.height];
                  persistShape(shape, whiteboardId);
                  //checks to find any bindings assosiated with the selected shapes.
                  //If any, they need to be updated as well.
                  const pageBindings = e.state.document.pages[e.getPage()?.id]?.bindings;
                  const boundShapes = [];
                  if (pageBindings) {
                    Object.entries(pageBindings).map(([k,b]) => {
                      if (b.toId.includes(id)) {
                        boundShapes.push(e.state.document.pages[e.getPage()?.id]?.shapes[b.fromId])
                      }
                    })
                  }
                  //persist shape(s) that was updated by the client and any shapes bound to it.
                  boundShapes.forEach(bs => {
                    const shapeBounds = e.getShapeBounds(bs.id);
                    bs.size = [shapeBounds.width, shapeBounds.height];
                    persistShape(bs, whiteboardId)
                  })
                  const children = e.getShape(id).children
                  //also persist children of the selected shape (grouped shapes)
                  children && children.forEach(c => {
                    const shape = e.getShape(c);
                    const shapeBounds = e.getShapeBounds(c);
                    shape.size = [shapeBounds.width, shapeBounds.height];
                    persistShape(shape, whiteboardId)
                  })
                });
            }

            if (s?.includes("session:complete:EraseSession") || s?.includes("delete")) {
              const pageShapes = e.state.document.pages[e.getPage()?.id]?.shapes;
              let shapesIdsToRemove = findRemoved(Object.keys(shapes), Object.keys(pageShapes))
              removeShapes(shapesIdsToRemove, whiteboardId)
            }
          }}

          onPatch={(s, reason) => {
            if (reason && isPresenter && (reason.includes("zoomed") || reason.includes("panned"))) {
              const camera = tldrawAPI.getPageState().camera;
              //don't allow zoom out more than fit
              if (camera.zoom <= cameraFitSlide.zoom) {
                tldrawAPI?.setCamera(cameraFitSlide.point, cameraFitSlide.zoom);
                setZoomedIn(false);
                zoomSlide(parseInt(curPageId), podId, 0, 0, 0);
              } else {
                zoomSlide(parseInt(curPageId), podId, camera.zoom, camera.point[0], camera.point[1]);
                setZoomedIn(true);
              }
            }
            //don't allow non-presenters to pan&zoom
            if (slidePosition && reason && !isPresenter && (reason.includes("zoomed") || reason.includes("panned"))) {
              if (slidePosition.zoom === 0 && slidePosition.xCamera === 0 && slidePosition.yCamera === 0) {
                tldrawAPI?.setCamera(cameraFitSlide.point, cameraFitSlide.zoom);
                setZoomedIn(false);
              } else {
                tldrawAPI?.setCamera([slidePosition.xCamera, slidePosition.yCamera], slidePosition.zoom);
                setZoomedIn(true);
              }
            } 
          }}

        />
      </Cursors>
    </>
  );
}
