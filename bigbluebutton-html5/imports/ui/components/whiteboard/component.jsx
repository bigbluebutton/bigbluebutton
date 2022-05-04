import * as React from "react";
import _ from "lodash";
import Cursors from "./cursors/container";
import { TldrawApp, Tldraw } from "@tldraw/tldraw";
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
    publishCursorUpdate,
    curPres,
    curSlide,
    changeCurrentSlide,
  } = props;
  console.log('curPres : ', curPres)
  const { pages, pageStates } = initDefaultPages(curPres?.pages.length || 1);
  const rDocument = React.useRef({
    name: "test",
    version: TldrawApp.version,
    id: `WB-${meetingId}`,
    pages,
    pageStates,
    bindings: {},
    assets,
  });
  const [doc, setDoc] = React.useState(rDocument.current);
  const [curPage, setCurPage] = React.useState({ id: "1" });
  const [ass, setAss] = React.useState(assets);
  const [command, setCommand] = React.useState("");
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [tldrawAPI, setTLDrawAPI] = React.useState(null);
  const prevShapes = usePrevious(shapes);
  const prevPage = usePrevious(curPage);

  const handleChange = React.useCallback((state) => {
    rDocument.current = state.document;
  }, []);

  React.useMemo(() => {
    const currentDoc = rDocument.current;
    const propShapes = Object.entries(shapes || {})?.map(([k, v]) => v.id);

    if (!curPage && tldrawAPI) {
      tldrawAPI.getPage();
    }

    const next = { ...currentDoc };

    next.assets = { ...assets };

    const pShapes = Object.entries(shapes || {})?.map(([k, v]) => v.id);
    shapes?.forEach((s) => {
      try {
        Object.keys(next.pages[s.parentId].shapes).map((k) => {
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
        childIndex: 1,
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

    }
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

    setDoc(next);
// 
    if (
      tldrawAPI &&
      !_.isEqual(shapes, prevShapes) &&
      !_.isEqual(assets, ass)
    ) {
      setAss(assets);
      tldrawAPI?.replacePageContent(next?.pages[pageID]?.shapes, {}, assets);
    }

    if (tldrawAPI && !_.isEqual(shapes, prevShapes) && !_.isEqual(assets, ass)) {
      tldrawAPI?.replacePageContent(next?.pages[pageID]?.shapes, {}, assets);
    }
    
    // setDoc(next);

  }, [assets, shapes, curPres, tldrawAPI]);

  React.useEffect(() => {
    isPresenter && curPage && changeCurrentSlide(curPage?.id);
  }, [curPage]);

  React.useEffect(() => {
    tldrawAPI &&
      !isPresenter &&
      curSlide?.activeSlide &&
      tldrawAPI.changePage(curSlide?.activeSlide);
  }, [curSlide]);

  return (
    <>
      <Cursors
        tldrawAPI={tldrawAPI}
        currentUser={currentUser}
        publishCursorUpdate={publishCursorUpdate}
      >
        <Tldraw
          document={doc}
          disableAssets={false}
          onChangePage={(app, s, b, a) => {
            setCurPage(app.getPage());
          }}
          onMount={(app) => {
            setTLDrawAPI(app);
          }}
          onChange={handleChange}
          onPersist={(e) => {
            ///////////// handle assets /////////////////////////
            e?.assets?.forEach((a) => {
              persistAsset(a);
            });
          }}
          showPages={false || isPresenter}
          showUI={true || isPresenter}
          showMenu={false}
          showMultiplayerMenu={false}
          // readOnly={!isPresenter}

          onUndo={s => {
            s?.selectedIds?.map(id => {
              persistShape(s.getShape(id));
            })
          }}

          onRedo={s => {
            s?.selectedIds?.map(id => {
              persistShape(s.getShape(id));
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
                    persistShape(s);
                  }
                });
            }

            if (s.includes("style")
            || s?.includes("session:complete:ArrowSession")) {
              e.selectedIds.forEach(id => {
                persistShape(e.getShape(id));
              }); 
            }

            if (s?.includes("session:complete:TransformSingleSession") 
              || s?.includes("session:complete:TranslateSession") 
              || s?.includes("updated_shapes")
              || s?.includes("session:complete:RotateSession")) {
                e.selectedIds.forEach(id => {
                    persistShape(e.getShape(id));
                    //checks to find any bindings assosiated with the selected shapes.
                    //If any, they need to be updated as well.
                    const pageBindings = rDocument?.current?.pages[e.getPage()?.id]?.bindings;
                    const boundShapes = [];
                    if (pageBindings) {
                      Object.entries(pageBindings).map(([k,b]) => {
                        if (b.toId.includes(id)) {
                          boundShapes.push(rDocument?.current?.pages[e.getPage()?.id]?.shapes[b.fromId])
                        }
                      })
                    }
                    //persist shape(s) that was updated by the client and any shapes bound to it.
                    boundShapes.forEach(bs => persistShape(bs))
                });
            }

            if (s?.includes("session:complete:EraseSession") || s?.includes("delete")) {
              let shapesIdsToRemove = []
              shapes.forEach(s => {
                const ids = e.shapes.map(ss => ss.id);
                if (!ids.includes(s.id)) shapesIdsToRemove.push(s.id);
              });
              removeShapes(shapesIdsToRemove)
            }
          }}

        />
      </Cursors>
    </>
  );
}
