import * as React from "react";
import _ from 'lodash';
import Cursors from "./cursors/container";
import { TldrawApp, Tldraw } from "@tldraw/tldraw";
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
    removeShape,
    initDefaultPages,
    meetingId,
    persistShape,
    persistAsset,
    shapes,
    assets,
    currentUser,
    publishCursorUpdate,
  } = props;
  const { pages, pageStates } = initDefaultPages();
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
  const [ass, setAss] = React.useState(assets);
  const [tldrawAPI, setTLDrawAPI] = React.useState(null);
  const prevShapes = usePrevious(shapes);

  const handleChange = React.useCallback((state) => {
    rDocument.current = state.document;
  }, []);

  React.useMemo(() => {
    const currentDoc = rDocument.current;
    const propShapes = Object.entries(shapes || {})?.map(([k, v]) => v.id);

    for (let i = 0; i < Object.keys(currentDoc?.pages).length; i++) {
      const localShapes = Object.entries(currentDoc?.pages[i + 1]?.shapes)?.map(
        ([k, v]) => v.id
      );
      const removeShapes = findRemoved(localShapes, propShapes);
      removeShapes.forEach((s) => {
        delete currentDoc?.pages[i + 1]?.shapes[s];
      });
    }

    const next = { ...currentDoc };

    next.assets = { ...assets };

    !_.isEqual(shapes, prevShapes) && shapes.forEach((s) => {
      next.pages[s.parentId] = {
        ...next.pages[s.parentId],
        shapes: {
          ...next.pages[s.parentId].shapes,
          [s.id]: { ...s },
        },
      };
    });

    rDocument.current = next;

    if (next.pageStates[1].selectedIds.length > 0) {
      // if a selected id is not in the list of shapes remove it from list
      next.pageStates[1].selectedIds.map((k) => {
        if (!next.pages[1].shapes[k]) {
          next.pageStates[1].selectedIds =
            next.pageStates[1].selectedIds.filter((id) => id !== k);
        }
      });
    }

    setDoc(next);
    if (tldrawAPI && !_.isEqual(shapes, prevShapes) && !_.isEqual(assets, ass)) {
      tldrawAPI.replacePageContent(shapes, {}, assets);
      setAss(assets);
    }
  }, [shapes]);


  console.log('Renderer', Renderer)

  return (
    <Cursors tldrawAPI={tldrawAPI} currentUser={currentUser} publishCursorUpdate={publishCursorUpdate}>
    <Tldraw
      document={doc}
      disableAssets={false}
      onChangePresence={(app, user) => {
        console.log('onChangePresence  : ', app, user)

        app.onPointerMove = onPointerMove = (point, user) => {
          console.log('ON Pointer Move')
        }
      }}
      onPatch={(e) => {
        // console.log('onPatch  : ', e)
      }}
      onMount={(app) => {
        setTLDrawAPI(app);

        // app?.onPointerMove(e => {
        //   console.log('ONPOINTER MOCE ADASDASD', e)
        // })
      }}
      onChange={handleChange}
      onPersist={(e) => {
        ///////////// handle assets /////////////////////////
        e?.assets?.forEach((a) => {
          persistAsset(a);
        });

        ///////////// handle shapes /////////////////////////
        if (e?.selectedIds.length < 1) {
          Object.entries(e.getShapes())?.forEach(([k, v]) => {
            if (v.type === "draw") persistShape(v);
          });
        } else {
          Object.entries(e.getShapes())?.forEach(([k, v]) => {
            persistShape(v);
          }); 
        }

        const propShapes = Object.entries(shapes || {})?.map(([k, v]) => v.id);
        const localShapes = Object.entries(e.getShapes())?.map(
          ([k, v]) => v.id
        );
        const removedShapes = findRemoved(propShapes, localShapes);
        if (removedShapes && removedShapes.length > 0) {
          removedShapes.forEach((s) => removeShape(s));
        }
      }}
      // showPages={true || isPresenter}
      showPages={false}
      showUI={true || isPresenter}
      showMenu={true}
      showMultiplayerMenu={false}
      // readOnly={!isPresenter}
    />
    </Cursors>
  );
}
