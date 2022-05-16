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
    slidePosition,
    curPageId,
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
  const [doc, setDoc] = React.useState(rDocument.current);
  const [curPage, setCurPage] = React.useState({ id: "1" });
  const [_assets, setAssets] = React.useState(assets);
  const [command, setCommand] = React.useState("");
  const [wbAccess, setWBAccess] = React.useState(props?.hasMultiUserAccess(props.whiteboardId, props.currentUser.userId));
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [tldrawAPI, setTLDrawAPI] = React.useState(null);
  const prevShapes = usePrevious(shapes);
  const prevPage = usePrevious(curPage);
  const prevSlidePosition = usePrevious(slidePosition);

  const handleChange = React.useCallback((state, reason) => {
    rDocument.current = state.document;
  }, []);

  React.useMemo(() => {
    const currentDoc = rDocument.current;
    const propShapes = Object.entries(shapes.filter(s => s.parentId === tldrawAPI?.getPage()?.id) || {})?.map(([k, v]) => v.id);

    if (tldrawAPI) {
      tldrawAPI?.getPage()?.id && tldrawAPI.changePage(tldrawAPI?.getPage()?.id);
    }

    const next = { ...currentDoc };

    next.assets = { ...assets };

    const pShapes = Object.entries(shapes || {})?.map(([k, v]) => v.id);
    shapes.filter(s => s.parentId === tldrawAPI?.getPage()?.id)?.forEach((s) => {
      try {
        Object.keys(next.pages[s.parentId].shapes).forEach((k) => {
          if (!pShapes.includes(k) && s.parentId === tldrawAPI?.getPage()?.id) {
            delete next.pages[s.parentId].shapes[k];
          }
        });

        next.pages[s.parentId] = {
          ...next.pages[s.parentId],
          shapes: {
            ...next.pages[s.parentId].shapes,
            [s.id]: { ...s },
          },
        };

      } catch (err) {

      }
    });

    if (curPres?.pages.length) {
      curPres.pages.map((p, i) => {
        next.assets[`slide-background-asset-${i}`] = {
          id: `slide-background-asset-${i}`,
          size: [2560 / 3.5, 1440 / 3.5],
          src: curPres?.pages[i]?.svgUri,
          type: "image",
        };

        try {
          next.pages[i + 1]["shapes"]["slide-background-shape"] = {
            assetId: `slide-background-asset-${i}`,
            childIndex: 1,
            id: "slide-background-shape",
            name: "Image",
            type: TDShapeType.Image,
            parentId: `${i + 1}`,
            point: [50, 60],
            isLocked: true,
            size: [2560 / 3.5, 1440 / 3.5],
            style: {
              dash: DashStyle.Draw,
              size: SizeStyle.Medium,
              color: ColorStyle.Blue,
            },
          };
        } catch (err) {
          logger.error({
            logCode: 'whiteboard_set_slide_background_error',
            extraInfo: { error: err },
          }, 'Error on adding background slide image');
        }
        return p;
        // setDoc(next);
      });
    }

    rDocument.current = next;

    const pageID = tldrawAPI?.getPage()?.id;
    if (next.pageStates[pageID]?.selectedIds.length > 0) {
      // if a selected id is not in the list of shapes remove it from list
      next.pageStates[pageID]?.selectedIds.map((k) => {
        if (!next.pages[pageID].shapes[k]) {
          next.pageStates[pageID].selectedIds =
            next.pageStates[pageID].selectedIds.filter(
              (id) => id !== k
            );
        }
      });
    }

    if (next.pageStates[pageID] && !isPresenter && !_.isEqual(slidePosition, prevSlidePosition)) {
      next.pageStates[pageID].camera.point = [slidePosition.xCamera, slidePosition.yCamera]
      next.pageStates[pageID].camera.zoom = slidePosition.zoom
    }

    setDoc(next);

    if (
      tldrawAPI &&
      !_.isEqual(shapes, prevShapes) &&
      !_.isEqual(assets, _assets)
    ) {
      setAssets(assets);
      tldrawAPI?.replacePageContent(next?.pages[pageID]?.shapes, {}, assets);
    }

    if (tldrawAPI && !_.isEqual(shapes, prevShapes) && !_.isEqual(assets, _assets)) {
      tldrawAPI?.replacePageContent(next?.pages[pageID]?.shapes, {}, assets);
    }
  }, [assets, shapes, curPres, tldrawAPI, curPageId]);

  React.useEffect(() => {
    isPresenter && curPage && changeCurrentSlide(curPage?.id);
  }, [curPage]);

  React.useEffect(() => {
    tldrawAPI &&
      !isPresenter &&
      curSlide?.activeSlide &&
      tldrawAPI.changePage(curSlide?.activeSlide);
  }, [curSlide]);

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
          onChangePage={(app, s, b, a) => {
            setCurPage(app.getPage());
          }}
          onMount={(app) => {
            setTLDrawAPI(app);
            props.setTldrawAPI(app);
          }}
          onChange={handleChange}
          onPersist={(e) => {
            ///////////// handle assets /////////////////////////
            e?.assets?.forEach((a) => {
              persistAsset(a);
            });
          }}
          showPages={false}
          showZoom={false}
          showUI={isPresenter || hasWBAccess}
          showMenu={false}
          showMultiplayerMenu={false}
          readOnly={!isPresenter && !hasWBAccess}
          onUndo={s => {
            s?.selectedIds?.map(id => {
              persistShape(s.getShape(id), whiteboardId);
            })
          }}

          onRedo={s => {
            s?.selectedIds?.map(id => {
              persistShape(s.getShape(id), whiteboardId);
            });
          }}

          onChangePage={(app, s, b, a) => {
            if (curPage?.id !== app.getPage()?.id) setCurPage(app.getPage());
          }}
          onCommand={(e, s, g) => {
            if (s.includes("session:complete:DrawSession")) {
              Object.entries(rDocument?.current?.pages[e.getPage()?.id]?.shapes)
                .filter(([k, s]) => s?.type === 'draw')
                .forEach(([k, s]) => {
                  if (!e.prevShapes[k] || !k.includes('slide-background')) {
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

            if (s?.includes("session:complete:TransformSingleSession") 
              || s?.includes("session:complete:TranslateSession") 
              || s?.includes("updated_shapes")
              || s?.includes("session:complete:RotateSession")) {
                e.selectedIds.forEach(id => {
                    persistShape(e.getShape(id), whiteboardId);
                    //checks to find any bindings assosiated with the selected shapes.
                    //If any, they need to be updated as well.
                    const pageBindings = rDocument?.current?.pages[e.getPage()?.id]?.bindings;
                    const boundShapes = [];
                    if (pageBindings) {
                      Object.entries(pageBindings).map(([k,b]) => {
                        if (b.toId.includes(id), whiteboardId) {
                          boundShapes.push(rDocument?.current?.pages[e.getPage()?.id]?.shapes[b.fromId])
                        }
                      })
                    }
                    //persist shape(s) that was updated by the client and any shapes bound to it.
                    boundShapes.forEach(bs => persistShape(bs, whiteboardId))
                });
            }

            if (s?.includes("session:complete:EraseSession") || s?.includes("delete")) {
              let shapesIdsToRemove = []
              shapes.forEach(s => {
                const ids = e.shapes.map(ss => ss.id);
                if (!ids.includes(s.id)) shapesIdsToRemove.push(s.id);
              });
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
