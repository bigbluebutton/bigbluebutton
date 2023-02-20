import * as React from 'react';
import { Meteor } from 'meteor/meteor';
import { throttle } from 'lodash';

const XS_OFFSET = 8;
const SMALL_OFFSET = 18;
const XL_OFFSET = 85;
const BOTTOM_CAM_HANDLE_HEIGHT = 10;
const PRES_TOOLBAR_HEIGHT = 35;

const { cursorInterval: CURSOR_INTERVAL } = Meteor.settings.public.whiteboard;
const hostUri = `https://${window.document.location.hostname}`;
const baseName = hostUri + Meteor.settings.public.app.cdn + Meteor.settings.public.app.basename;
const makeCursorUrl = (filename) => `${baseName}/resources/images/whiteboard-cursor/${filename}`;

const TOOL_CURSORS = {
  select: 'none',
  erase: 'none',
  arrow: 'none',
  draw: `url('${makeCursorUrl('pencil.png')}') 2 22, default`,
  rectangle: `url('${makeCursorUrl('square.png')}'), default`,
  ellipse: `url('${makeCursorUrl('ellipse.png')}'), default`,
  triangle: `url('${makeCursorUrl('triangle.png')}'), default`,
  line: `url('${makeCursorUrl('line.png')}'), default`,
  text: `url('${makeCursorUrl('text.png')}'), default`,
  sticky: `url('${makeCursorUrl('square.png')}'), default`,
  pan: `url('${makeCursorUrl('pan.png')}'), default`,
  moving: 'move',
};

const Cursor = (props) => {
  const {
    name,
    color,
    x,
    y,
    currentPoint,
    tldrawCamera,
    isMultiUserActive,
    owner = false,
  } = props;

  const z = !owner ? 2 : 1;
  let _x = null;
  let _y = null;

  if (!currentPoint) {
    _x = (x + tldrawCamera?.point[0]) * tldrawCamera?.zoom;
    _y = (y + tldrawCamera?.point[1]) * tldrawCamera?.zoom;
  }

  return (
    <>
      <div
        style={{
          zIndex: z,
          position: 'absolute',
          left: (_x || x) - 2.5,
          top: (_y || y) - 2.5,
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: `${color}`,
          pointerEvents: 'none',
        }}
      />

      {isMultiUserActive && (
      <div
        style={{
          zIndex: z,
          position: 'absolute',
          pointerEvents: 'none',
          left: (_x || x) + 3.75,
          top: (_y || y) + 3,
          paddingLeft: '.25rem',
          paddingRight: '.25rem',
          paddingBottom: '.1rem',
          lineHeight: '1rem',
          borderRadius: '2px',
          color: '#FFF',
          backgroundColor: color,
          border: `1px solid ${color}`,
        }}
      >
        {name}
      </div>
      )}
    </>
  );
};

const PositionLabel = (props) => {
  const {
    currentUser,
    currentPoint,
    tldrawCamera,
    publishCursorUpdate,
    whiteboardId,
    pos,
    isMultiUserActive,
  } = props;

  const { name, color, userId } = currentUser;
  const { x, y } = pos;

  const cursorUpdate = (x,y) => {
    try {
      const point = [x, y];
      publishCursorUpdate({
        xPercent:
          point[0] / tldrawCamera?.zoom - tldrawCamera?.point[0],
        yPercent:
          point[1] / tldrawCamera?.zoom - tldrawCamera?.point[1],
        whiteboardId,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const throttledCursorUpdate = React.useRef(throttle((x,y) => {
    cursorUpdate(x,y);
  },
  CURSOR_INTERVAL, { trailing: false }));

  React.useEffect(() => {
    throttledCursorUpdate.current(x,y);
  }, [x, y]);

  return (
    <>
      <div style={{ position: 'absolute', height: '100%', width: '100%' }}>
        <Cursor
          key={`${userId}-label`}
          name={name}
          color={color}
          x={x}
          y={y}
          currentPoint={currentPoint}
          tldrawCamera={tldrawCamera}
          isMultiUserActive={isMultiUserActive(whiteboardId)}
        />
      </div>
    </>
  );
};

export default function Cursors(props) {
  const cursorWrapper = React.useRef();
  const [active, setActive] = React.useState(false);
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  const {
    whiteboardId,
    otherCursors,
    currentUser,
    currentPoint,
    tldrawCamera,
    publishCursorUpdate,
    children,
    isViewersCursorLocked,
    hasMultiUserAccess,
    isMultiUserActive,
    isPanning,
    isMoving,
    currentTool,
    isPresentationDetached,
    presentationWindow,
  } = props;

  const start = () => setActive(true);

  const end = () => {
    if (whiteboardId) {
      publishCursorUpdate({
        xPercent: -1.0,
        yPercent: -1.0,
        whiteboardId,
      });
    }
    setActive(false);
  };

  const moved = (event) => {
    const { type, x, y } = event;
    const nav = document.getElementById('Navbar');
    const getSibling = (el) => {
      if (el?.previousSibling && !el?.previousSibling?.hasAttribute('data-test')) {
        return el?.previousSibling;
      }
      return null;
    };
    const panel = getSibling(nav);
    const webcams = document.getElementById('cameraDock');
    const subPanel = panel && getSibling(panel);
    const camPosition = document.getElementById('layout')?.getAttribute('data-cam-position') || null;
    const sl = document.getElementById('layout')?.getAttribute('data-layout');
    const presentationContainer = document.querySelector('[data-test="presentationContainer"]');
    //Only this one needs to be obtained from presentationWindow, but when the presentation is re-attached, this will become null.. so stay without presentationWindow. Anyway only style.height/width values are used at calcPresOffset
    const presentation = document.getElementById('currentSlideText')?.parentElement;
    const banners = document.querySelectorAll('[data-test="notificationBannerBar"]');
    let yOffset = 0;
    let xOffset = 0;
    const calcPresOffset = () => {
      yOffset
        += (parseFloat(presentationContainer?.style?.height)
          - (parseFloat(presentation?.style?.height)
          + (currentUser.presenter ? PRES_TOOLBAR_HEIGHT : 0))
        ) / 2;
      xOffset
        += (parseFloat(presentationContainer?.style?.width)
          - parseFloat(presentation?.style?.width)
        ) / 2;
    };
    // If the presentation container is the full screen element we don't
    // need any offsets
    // Does not need to be presentationWindow.document, because when isPresentationDetached, the offsets will be anyway ignored.
    const { webkitFullscreenElement, fullscreenElement } = document;
    const fsEl = webkitFullscreenElement || fullscreenElement;
    if (fsEl?.getAttribute('data-test') === 'presentationContainer') {
      calcPresOffset();
      return setPos({ x: x - xOffset, y: y - yOffset });
    }
    if (nav) yOffset += parseFloat(nav?.style?.height);
    if (panel) xOffset += parseFloat(panel?.style?.width);
    if (subPanel) xOffset += parseFloat(subPanel?.style?.width);

    // offset native tldraw eraser animation container
    const overlay = presentationWindow.document.getElementsByClassName('tl-overlay')[0];
    if (overlay) overlay.style.left = '0px';

    if (type === 'touchmove') {
      calcPresOffset();
      if (!active) {
        setActive(true);
      }
      const newX = event?.changedTouches[0]?.clientX - xOffset;
      const newY = event?.changedTouches[0]?.clientY - yOffset;
      return setPos({ x: newX, y: newY });
    }

    //dir element cannot be obtained from the detached window
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
          const dockPos = webcams?.getAttribute('data-position');
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
          const dockPos = webcams?.getAttribute('data-position');
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

    if (banners) {
      banners.forEach((el) => {
        yOffset += parseFloat(window.getComputedStyle(el).height);
      });
    }
    
    if (isPresentationDetached) {
      return setPos({ x: event.x, y: event.y });
    } else {
      return setPos({ x: event.x - xOffset, y: event.y - yOffset });
    }
  };

  React.useEffect(() => {
    const currentCursor = cursorWrapper?.current;

    currentCursor?.addEventListener('mouseenter', start);
    currentCursor?.addEventListener('mouseleave', end);
    currentCursor?.addEventListener('touchend', end);
    currentCursor?.addEventListener('mousemove', moved);
    currentCursor?.addEventListener('touchmove', moved);

    return () => {
      currentCursor?.removeEventListener('mouseenter', start);
      currentCursor?.removeEventListener('mouseleave', end);
      currentCursor?.removeEventListener('touchend', end);
      currentCursor?.removeEventListener('mousemove', moved);
      currentCursor?.removeEventListener('touchmove', moved);
    };
  }, [cursorWrapper, whiteboardId, currentUser.presenter]);

  const multiUserAccess = hasMultiUserAccess(whiteboardId, currentUser?.userId);
  let cursorType = multiUserAccess || currentUser?.presenter ? TOOL_CURSORS[currentTool] || 'none' : 'default';
  if (isPanning) cursorType = TOOL_CURSORS.pan;
  if (isMoving) cursorType = TOOL_CURSORS.moving;

  return (
    <span key={`cursor-wrapper-${whiteboardId}`} ref={cursorWrapper}>
      <div style={{ height: '100%', cursor: cursorType }}>
        {((active && multiUserAccess) || (active && currentUser?.presenter)) && (
          <PositionLabel
            pos={pos}
            otherCursors={otherCursors}
            currentUser={currentUser}
            currentPoint={currentPoint}
            tldrawCamera={tldrawCamera}
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
          if ((isViewersCursorLocked && c?.role !== 'VIEWER')
            || !isViewersCursorLocked
            || currentUser?.presenter
          ) {
            return c;
          }
          return null;
        })
        .map((c) => {
          if (c && currentUser.userId !== c?.userId) {
            if (c.presenter) {
              return (
                <Cursor
                  key={`${c?.userId}`}
                  name={c?.userName}
                  color="#C70039"
                  x={c?.xPercent}
                  y={c?.yPercent}
                  tldrawCamera={tldrawCamera}
                  isMultiUserActive={isMultiUserActive(whiteboardId)}
                  owner
                />
              );
            }

            return hasMultiUserAccess(whiteboardId, c?.userId)
              && (
              <Cursor
                key={`${c?.userId}`}
                name={c?.userName}
                color="#AFE1AF"
                x={c?.xPercent}
                y={c?.yPercent}
                tldrawCamera={tldrawCamera}
                isMultiUserActive={isMultiUserActive(whiteboardId)}
                owner
              />
              );
          }
          return null;
        })}
    </span>
  );
}
