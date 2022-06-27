import * as React from "react";
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
    currentUser,
    currentPoint,
    pageState,
    publishCursorUpdate,
    whiteboardId,
    pos,
  } = props;

  const { name, color, userId, presenter } = currentUser;
  const prevCurrentPoint = usePrevious(currentPoint);

  React.useEffect(() => {
    try {
      const point = [pos.x, pos.y];
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
  }, [pos?.x, pos?.y]);

  return (
    <>
      <div style={{ position: "absolute", height: "100%", width: "100%" }}>
        {renderCursor(name, color, pos.x, pos.y, currentPoint, props.pageState)}
      </div>
    </>
  );
};

export default function Cursors(props) {
  let cursorWrapper = React.useRef(null);
  const [active, setActive] = React.useState(false);
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  const {
    whiteboardId,
    otherCursors,
    currentUser,
    tldrawAPI,
    publishCursorUpdate,
    children,
    isViewersCursorLocked
  } = props;

  const start = () => setActive(true);
  
  const end = () => {
    publishCursorUpdate({
      xPercent: null,   
      yPercent: null,
      whiteboardId: whiteboardId,
    });
    setActive(false);
  };

  const moved = (event) => {
    const { type } = event;
    const yOffset = parseFloat(document.getElementById('Navbar')?.style?.height);
    const getSibling = (el) => el?.previousSibling || null;
    const panel = getSibling(document.getElementById('Navbar'));
    const subPanel = panel && getSibling(panel);
    const xOffset = (parseFloat(panel?.style?.width) || 0) + (parseFloat(subPanel?.style?.width) || 0);
    if (type === 'touchmove') {
      !active && setActive(true);
      return setPos({ x: event?.changedTouches[0]?.clientX - xOffset, y: event?.changedTouches[0]?.clientY - yOffset });
    }
    return setPos({ x: event.x - xOffset, y: event.y - yOffset });
  }

  React.useEffect(() => {
    !cursorWrapper.hasOwnProperty("mouseenter") &&
      cursorWrapper?.addEventListener("mouseenter", start);

    !cursorWrapper.hasOwnProperty("mouseleave") &&
      cursorWrapper?.addEventListener("mouseleave", end);

    !cursorWrapper.hasOwnProperty("touchend") &&
      cursorWrapper?.addEventListener("touchend", end);

    !cursorWrapper.hasOwnProperty("mousemove") &&
      cursorWrapper?.addEventListener("mousemove", moved);

    !cursorWrapper.hasOwnProperty("touchmove") &&
      cursorWrapper?.addEventListener("touchmove", moved);
  }, [cursorWrapper]);

  React.useEffect(() => {
    return () => {
      cursorWrapper.removeEventListener('mouseenter', start);
      cursorWrapper.removeEventListener('mouseleave', end);
      cursorWrapper.removeEventListener('mousemove', moved);
      cursorWrapper.removeEventListener('touchend', end);
      cursorWrapper.removeEventListener('touchmove', moved);
    }
  }, []);

  return (
    <span disabled={true} ref={(r) => (cursorWrapper = r)}>
      <div style={{ height: "100%", cursor: "none" }}>
        {active && (
          <PositionLabel
            pos={pos}
            otherCursors={otherCursors}
            currentUser={currentUser}
            currentPoint={tldrawAPI?.currentPoint}
            pageState={tldrawAPI?.getPageState()}
            publishCursorUpdate={publishCursorUpdate}
            whiteboardId={whiteboardId}
          />
        )}
        {children}
      </div>
      {otherCursors
        .filter((c) => c?.xPercent && c?.yPercent)
        .filter((c) => {
          if ((isViewersCursorLocked && c?.role !== "VIEWER") || !isViewersCursorLocked || currentUser?.presenter) {
            return c;
          }
          return null;
        })
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
