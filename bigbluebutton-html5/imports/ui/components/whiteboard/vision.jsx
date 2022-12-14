import * as React from "react";
import _ from "lodash";
import { createGlobalStyle } from "styled-components";
import {
    ColorStyle,
    DashStyle,
    SizeStyle,
    TDDocument,
    TDShapeType,
    TDSnapshot,
    Tldraw,
    TldrawApp,
  } from '@tldraw/tldraw';
import { Utils } from "@tldraw/core";
import GridLayout from "react-grid-layout";

import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';
import './override.css';

function usePrevious(value) {
    const ref = React.useRef();
    React.useEffect(() => {
      ref.current = value;
    }, [value]);
    return ref.current;
}

export default function Vision(props) {
    const { shapes, objAPI, setObjAPI } = props;
    const prevShapes = usePrevious(props.shapes);
    const [api, setApi] = React.useState(null);
    const rDocument = React.useRef({
        name: `preview-${props.uid}`,
        version: TldrawApp.version,
        id: props.whiteboardId,
        "pages": {
            "1": {
                "id": "1",
                "name": `preview-${props.uid}`,
                "shapes": props.shapes,
                "bindings": {}
            },
        },
        "pageStates": {
            "1": {
                "id": "1",
                "selectedIds": [],
                "camera": {
                    "point": [0, 0],
                    "zoom": 0.1
                }
            },
        },
        "bindings": {},
        "assets": props.assets
    });

    const doc = React.useMemo(() => {
        const currentDoc = rDocument.current;

        let next = { ...currentDoc };

        let changed = false;

        if (next.pageStates[1] && !_.isEqual(prevShapes, shapes)) {
          next.pages[1].shapes = shapes;
          changed = true;
        }

        if (changed && api) {
          // merge patch manually (this improves performance and reduce side effects on fast updates)
          const patch = {
            document: {
              pages: {
                [1]: { shapes: shapes }
              },
            },
          };
          const prevState = api._state;
          const nextState = Utils.deepMerge(api._state, patch);
          const final = api.cleanup(nextState, prevState, patch, '');
          api._state = final;
          api?.forceUpdate();
        }

        return currentDoc;
    }, [props.shapes]);

    return (
        <Tldraw
            key={props.uid}
            document={doc}
            onMount={(api) => {
                api?.setSetting('isDarkMode', false);
                setApi(api);
                objAPI[props.uid] = api;
                setObjAPI(objAPI);
                const resizeHandles = document.getElementsByClassName('react-resizable-handle react-resizable-handle-se');
                for (var i = 0; i < resizeHandles.length; i++) {
                    resizeHandles[i].style.zIndex = 10;
                    resizeHandles[i].style.bottom = '-35px';
                    resizeHandles[i].style.marginBottom = '10px';
                }
            }}
            disableAssets={true}
            autofocus={false}
            showPages={false}
            showZoom={false}
            showUI={false}
            showMenu={false}
            showMultiplayerMenu={false}
            readOnly={true}
        />
  );
}