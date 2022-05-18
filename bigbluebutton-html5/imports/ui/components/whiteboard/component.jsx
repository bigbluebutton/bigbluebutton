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
import { Renderer } from "@tldraw/core";

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
    curSlide,
    changeCurrentSlide,
    whiteboardId,
    podId,
    zoomSlide,
    skipToSlide,
    slidePosition,
    curPageId,
    svgUri,
  } = props;

  if (!curPres || !curPageId) return null;

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
  const [curPage, setCurPage] = React.useState({ id: "1" });
  const [_assets, setAssets] = React.useState(assets);
  const [command, setCommand] = React.useState("");
  const [wbAccess, setWBAccess] = React.useState(props?.hasMultiUserAccess(props.whiteboardId, props.currentUser.userId));
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [tldrawAPI, setTLDrawAPI] = React.useState(null);
  const prevShapes = usePrevious(shapes);
  const prevPage = usePrevious(curPage);
  const prevSlidePosition = usePrevious(slidePosition);
  const prevPageId = usePrevious(curPageId);

  const doc = React.useMemo(() => {
    const currentDoc = rDocument.current;

    let next = { ...currentDoc };

    let pageBindings = null;
    let history = null;
    let changed = false;

    if (next.pageStates[curPageId] && !_.isEqual(prevShapes, shapes)) {
      // mergeDocument loses bindings and history, save it
      pageBindings = tldrawAPI?.getPage(curPageId)?.bindings;
      history = tldrawAPI?.history

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
        childIndex: 1,
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

    if (!isPresenter && !_.isEqual(slidePosition, prevSlidePosition)) {
      tldrawAPI?.setCamera([slidePosition.xCamera, slidePosition.yCamera], slidePosition.zoom);
    }

    if (changed) {
      tldrawAPI?.mergeDocument(next);
      if (tldrawAPI && history) tldrawAPI.history = history;
      if (pageBindings && Object.keys(pageBindings).length !== 0) {
        currentDoc.pages[curPageId].bindings = pageBindings;
      }
    }
    
    return currentDoc;
  }, [assets, shapes, curPres, tldrawAPI, curPageId, slidePosition]);

  React.useEffect(() => {
    //console.log("changing slide!! ", curPageId, tldrawAPI)
    tldrawAPI &&
      curPageId &&
      tldrawAPI.changePage(curPageId);
  }, [curPageId]);

  const hasWBAccess = props?.hasMultiUserAccess(props.whiteboardId, props.currentUser.userId);

  return (
    <>
      <Cursors
        tldrawAPI={tldrawAPI}
        currentUser={currentUser}
        whiteboardId={whiteboardId}
      >
        <Tldraw
          document={doc}
          disableAssets={false}
          onMount={(app) => {
            setTLDrawAPI(app);
            props.setTldrawAPI(app);
            curPageId && app.changePage(curPageId);
            //curPageId && app.setCamera([slidePosition.xCamera, slidePosition.yCamera], slidePosition.zoom)
          }}
          //onChange={handleChange}
          onPersist={(e) => {
            ///////////// handle assets /////////////////////////
            e?.assets?.forEach((a) => {
              //persistAsset(a);
            });
          }}
          showPages={false}
          showZoom={false}
          showUI={isPresenter || hasWBAccess}
          showMenu={false}
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
              persistShape(s.getShape(id), whiteboardId);
            });
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
                    persistShape(s, whiteboardId);
                  }
                });
            }

            if (s.includes("style")
            || s?.includes("session:complete:ArrowSession")) {
              e.selectedIds.forEach(id => {
                persistShape(e.getShape(id), whiteboardId);
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
            }

            if (s?.includes("session:complete:TransformSingleSession") 
              || s?.includes("session:complete:TranslateSession") 
              || s?.includes("updated_shapes")
              || s?.includes("session:complete:RotateSession")
              || s?.includes("session:complete:HandleSession")) {
                e.selectedIds.forEach(id => {
                    persistShape(e.getShape(id), whiteboardId);
                    //checks to find any bindings assosiated with the selected shapes.
                    //If any, they need to be updated as well.
                    const pageBindings = e.state.document.pages[e.getPage()?.id]?.bindings;
                    const boundShapes = [];
                    if (pageBindings) {
                      Object.entries(pageBindings).map(([k,b]) => {
                        if (b.toId.includes(id), whiteboardId) {
                          boundShapes.push(e.state.document.pages[e.getPage()?.id]?.shapes[b.fromId])
                        }
                      })
                    }
                    //persist shape(s) that was updated by the client and any shapes bound to it.
                    boundShapes.forEach(bs => persistShape(bs, whiteboardId))
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
              const pageID = tldrawAPI?.getPage()?.id;
              const camera = s.document.pageStates[pageID]?.camera
              zoomSlide(parseInt(pageID), podId, camera.zoom, camera.point[0], camera.point[1]);
            }
          }}

        />
      </Cursors>
    </>
  );
}
