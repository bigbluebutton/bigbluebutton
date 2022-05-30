import * as React from "react";
import ReactCursorPosition from "react-cursor-position";
import Vec from "@tldraw/vec";
import { _ } from "lodash";

function usePrevious(value) {
  const ref = React.useRef();
  React.useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

const renderCursor = (
  name,
  color,
  x,
  y,
  currentPoint,
  pageState,
  owner = false
) => {
  const z = !owner ? 2 : 1;
  let _x = null;
  let _y = null;

  if (!currentPoint) {
    _x = (x + pageState?.camera?.point[0]) * pageState?.camera?.zoom;
    _y = (y + pageState?.camera?.point[1]) * pageState?.camera?.zoom;
  }

  return (
    <>
      <div
        key={`${name}-${color}-${x}-${y}`}
        style={{
          zIndex: z,
          position: "absolute",
          left: (_x || x) - 2.5,
          top: (_y || y) - 2.5,
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: `${color}`,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          zIndex: z,
          position: "absolute",
          pointerEvents: "none",
          left: (_x || x) + 3.75,
          top: (_y || y) + 3,
          paddingLeft: ".25rem",
          paddingRight: ".25rem",
          paddingBottom: ".1rem",
          lineHeight: "1rem",
          borderRadius: "2px",
          color: "#FFF",
          backgroundColor: color,
          border: `1px solid ${color}`,
        }}
      >
        {name}
      </div>
    </>
  );
};

const PositionLabel = (props) => {
  const {
    position: { x = 0, y = 0 } = {},
    currentUser,
    currentPoint,
    pageState,
    publishCursorUpdate,
    whiteboardId,
  } = props;

  const { name, color, userId, presenter } = currentUser;
  const prevCurrentPoint = usePrevious(currentPoint);

  React.useEffect(() => {
    try {
      const point = _.isEqual(currentPoint, prevCurrentPoint)
        ? [x, y]
        : currentPoint;
      publishCursorUpdate({
        xPercent:
          point[0] / pageState?.camera?.zoom - pageState?.camera?.point[0],
        yPercent:
          point[1] / pageState?.camera?.zoom - pageState?.camera?.point[1],
        whiteboardId,
      });
    } catch (e) {
      console.log(e);
    }
  }, [x, y]);

  return (
    <>
      <div style={{ position: "absolute", height: "100%", width: "100%" }}>
        {renderCursor(name, color, x, y, currentPoint, props.pageState)}
      </div>
    </>
  );
};

export default function Cursors(props) {
  let cursorWrapper = React.useRef(null);
  const [active, setActive] = React.useState(false);
  const {
    whiteboardId,
    otherCursors,
    currentUser,
    tldrawAPI,
    publishCursorUpdate,
    children,
  } = props;
  React.useEffect(() => {
    !cursorWrapper.hasOwnProperty("mouseenter") &&
      cursorWrapper?.addEventListener("mouseenter", (event) => {
        setActive(true);
      });
    !cursorWrapper.hasOwnProperty("mouseleave") &&
      cursorWrapper?.addEventListener("mouseleave", (event) => {
        publishCursorUpdate({
          xPercent: null,
          yPercent: null,
          whiteboardId: whiteboardId,
        });
        setActive(false);
      });
  }, [cursorWrapper]);

  return (
    <span disabled={true} ref={(r) => (cursorWrapper = r)}>
      <ReactCursorPosition style={{ height: "100%", cursor: "none" }}>
        {active && (
          <PositionLabel
            otherCursors={otherCursors}
            currentUser={currentUser}
            currentPoint={tldrawAPI?.currentPoint}
            pageState={tldrawAPI?.getPageState()}
            publishCursorUpdate={publishCursorUpdate}
            whiteboardId={whiteboardId}
          />
        )}
        {children}
      </ReactCursorPosition>
      {otherCursors
        .filter((c) => c?.xPercent && c?.yPercent)
        .map((c) => {
          return (
            c &&
            currentUser.userId !== c?.userId &&
            renderCursor(
              c?.userName,
              c?.presenter ? "#C70039" : "#AFE1AF",
              c?.xPercent,
              c?.yPercent,
              null,
              tldrawAPI?.getPageState(),
              true
            )
          );
        })}
    </span>
  );
}
