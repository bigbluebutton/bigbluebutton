import * as React from "react";
const XS_OFFSET = 8;
const SMALL_OFFSET = 18;
const XL_OFFSET = 85;
const BOTTOM_CAM_HANDLE_HEIGHT = 10;
const PRES_TOOLBAR_HEIGHT = 35;

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
  isMultiUserActive,
  owner = false,

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

      {isMultiUserActive && <div
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
      </div>}
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
    isMultiUserActive,
  } = props;

  const { name, color } = currentUser;
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
        {renderCursor(name, color, pos.x, pos.y, currentPoint, props.pageState, isMultiUserActive(whiteboardId))}
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
    isViewersCursorLocked,
    hasMultiUserAccess,
    isMultiUserActive,
    application,
    isPanning,
  } = props;

  const start = () => setActive(true);
  
  const end = () => {
    if (whiteboardId) {
      publishCursorUpdate({
        xPercent: -1.0,
        yPercent: -1.0,
        whiteboardId,
      });
    };
    setActive(false);
  }

  const moved = (event) => {
    const { type, x, y } = event;
    const nav = document.getElementById('Navbar');
    const getSibling = (el) => el?.previousSibling || null;
    const panel = getSibling(nav);
    const webcams = document.getElementById('cameraDock');
    const subPanel = panel && getSibling(panel);
    const camPosition = document.getElementById('layout')?.getAttribute('data-cam-position') || null;
    const sl = document.getElementById('layout')?.getAttribute('data-layout');
    const presentationContainer = document.querySelector('[data-test="presentationContainer"]');
    const presentation = document.getElementById('currentSlideText')?.parentElement;
    let yOffset = 0;
    let xOffset = 0;
    const calcPresOffset = () => {
      yOffset += (parseFloat(presentationContainer?.style?.height) - (parseFloat(presentation?.style?.height) + (currentUser.presenter ? PRES_TOOLBAR_HEIGHT : 0))) / 2;
      xOffset += (parseFloat(presentationContainer?.style?.width) - parseFloat(presentation?.style?.width)) / 2;
    }
    // If the presentation container is the full screen element we don't need any offsets
    const fsEl = document?.webkitFullscreenElement || document?.fullscreenElement;
    if (fsEl?.getAttribute('data-test') === "presentationContainer") {
      calcPresOffset();
      return setPos({ x: x - xOffset, y: y - yOffset });
    }
    if (nav) yOffset += parseFloat(nav?.style?.height);
    if (panel) xOffset += parseFloat(panel?.style?.width);
    if (subPanel) xOffset += parseFloat(subPanel?.style?.width);

    // disable native tldraw eraser animation
    const eraserLine = document.getElementsByClassName('tl-erase-line')[0];
    if (eraserLine) eraserLine.style.display = `none`;
        
    if (type === 'touchmove') {
      calcPresOffset();
      !active && setActive(true);
      return setPos({ x: event?.changedTouches[0]?.clientX - xOffset, y: event?.changedTouches[0]?.clientY - yOffset });
    }

    if (document?.documentElement?.dir === 'rtl') { 
      xOffset = 0;
      if (presentationContainer && presentation) {
        calcPresOffset();
      }
      if (sl.includes('custom')) {
        if (webcams) {
          if (camPosition === 'contentTop' || !camPosition) {
            yOffset += (parseFloat(webcams?.style?.height || 0) + BOTTOM_CAM_HANDLE_HEIGHT);
          }
          if (camPosition === 'contentBottom') {
            yOffset -= BOTTOM_CAM_HANDLE_HEIGHT;
          }
          if (camPosition === 'contentRight') {
            xOffset += (parseFloat(webcams?.style?.width || 0) + SMALL_OFFSET);
          }
        }
      }
      if (sl?.includes('smart')) {
        if (panel || subPanel) {
          const dockPos = webcams?.getAttribute("data-position");
          if (dockPos === 'contentTop') {
            yOffset += (parseFloat(webcams?.style?.height || 0) + SMALL_OFFSET);
          }
        }
      }
      if (webcams && sl?.includes('videoFocus')) {
        xOffset += parseFloat(nav?.style?.width);
        yOffset += (parseFloat(panel?.style?.height || 0) - XL_OFFSET);
      }
    } else {
      if (sl.includes('custom')) {
        if (webcams) {
          if (camPosition === 'contentTop' || !camPosition) {
            yOffset += (parseFloat(webcams?.style?.height) || 0) + XS_OFFSET;
          }
          if (camPosition === 'contentBottom') {
            yOffset -= BOTTOM_CAM_HANDLE_HEIGHT;
          }
          if (camPosition === 'contentLeft') {
            xOffset += (parseFloat(webcams?.style?.width) || 0) + SMALL_OFFSET;
          }
        }
      }
  
      if (sl.includes('smart')) {
        if (panel || subPanel) {
          const dockPos = webcams?.getAttribute("data-position");
          if (dockPos === 'contentLeft') {
            xOffset += (parseFloat(webcams?.style?.width || 0) + SMALL_OFFSET);
          }
          if (dockPos === 'contentTop') {
            yOffset += (parseFloat(webcams?.style?.height || 0) + SMALL_OFFSET);
          }
        } 
        if (!panel && !subPanel) {
          if (webcams) {
            xOffset = parseFloat(webcams?.style?.width || 0) + SMALL_OFFSET;
          }
        }
      }
      if (sl?.includes('videoFocus')) {
        if (webcams) {
          xOffset = parseFloat(subPanel?.style?.width);
          yOffset = parseFloat(panel?.style?.height);
        }
      }
      if (presentationContainer && presentation) {
        calcPresOffset();
      }
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
  }, [cursorWrapper, whiteboardId]);

  React.useEffect(() => {
    return () => {
      if (cursorWrapper) {
        cursorWrapper.removeEventListener('mouseenter', start);
        cursorWrapper.removeEventListener('mouseleave', end);
        cursorWrapper.removeEventListener('mousemove', moved);
        cursorWrapper.removeEventListener('touchend', end);
        cursorWrapper.removeEventListener('touchmove', moved);
      }
    }
  });

  const multiUserAccess = hasMultiUserAccess(whiteboardId, currentUser?.userId);
  let cursorType = multiUserAccess || currentUser?.presenter ? "none" : "default";
  if (isPanning) cursorType = 'grab';

  return (
    <span ref={(r) => (cursorWrapper = r)}>
      <div style={{ height: "100%", cursor: cursorType }}>
        {(active && multiUserAccess || (active && currentUser?.presenter)) && (
          <PositionLabel
            pos={pos}
            otherCursors={otherCursors}
            currentUser={currentUser}
            currentPoint={tldrawAPI?.currentPoint}
            pageState={tldrawAPI?.getPageState()}
            publishCursorUpdate={publishCursorUpdate}
            whiteboardId={whiteboardId}
            isMultiUserActive={isMultiUserActive}
          />
        )}
        {children}
      </div>
      {otherCursors
        .filter((c) => c?.xPercent && c.xPercent !== -1.0 && c?.yPercent && c.yPercent !== -1.0)
        .filter((c) => {
          if ((isViewersCursorLocked && c?.role !== "VIEWER") || !isViewersCursorLocked || currentUser?.presenter) {
            return c;
          }
          return null;
        })
        .map((c) => {
          if (c && currentUser.userId !== c?.userId) {
            if (c.presenter) {
              return renderCursor(
                c?.userName,
                "#C70039",
                c?.xPercent,
                c?.yPercent,
                null,
                tldrawAPI?.getPageState(),
                isMultiUserActive(whiteboardId),
                true
              );
            }

            return hasMultiUserAccess(whiteboardId, c?.userId) && (
              renderCursor(
                c?.userName,
                "#AFE1AF",
                c?.xPercent,
                c?.yPercent,
                null,
                tldrawAPI?.getPageState(),
                isMultiUserActive(whiteboardId),
                true
              )
            );
          }
        })}
    </span>
  );
}
