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
    _x = ((x) + pageState?.camera?.point[0]) * pageState?.camera?.zoom;
    _y = ((y) + pageState?.camera?.point[1]) * pageState?.camera?.zoom;
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
    detectedEnvironment: {
      isMouseDetected = false,
      isTouchDetected = false,
    } = {},
    elementDimensions: { width = 0, height = 0 } = {},
    isActive = false,
    isPositionOutside = false,
    position: { x = 0, y = 0 } = {},
    currentUser,
    currentPoint,
    pageState,
    publishCursorUpdate,
  } = props;

  const { name, color, userId, presenter } = currentUser;
  const prevCurrentPoint = usePrevious(currentPoint);

  React.useEffect(() => {
    try {
      const point = _.isEqual(currentPoint, prevCurrentPoint)
        ? [x, y]
        : currentPoint;
      props.publishCursorUpdate(
        userId,
        name,
        ((point[0] / props.pageState.camera.zoom) - props.pageState.camera.point[0]),
        ((point[1] / props.pageState.camera.zoom) - props.pageState.camera.point[1]),
        presenter
      );
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
  return (
    <>
      <ReactCursorPosition style={{ height: "100%", cursor: "none" }}>
        <PositionLabel
          otherCursors={props.otherCursors}
          currentUser={props.currentUser}
          currentPoint={props.tldrawAPI?.currentPoint}
          pageState={props.tldrawAPI?.getPageState()}
          publishCursorUpdate={props.publishCursorUpdate}
        />
        {props.children}
      </ReactCursorPosition>
      {props.otherCursors.map((c) => {
        return (
          props.currentUser.userId !== c.userId &&
          // !c.isPositionOutside &&
          renderCursor(
            c.name,
            c.presenter ? "#C70039" : "#AFE1AF",
            c.x,
            c.y,
            null,
            props.tldrawAPI?.getPageState(),
            true
          )
        );
      })}
    </>
  );
}
