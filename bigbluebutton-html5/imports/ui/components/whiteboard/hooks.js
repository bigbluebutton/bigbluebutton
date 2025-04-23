import React, { useState, useEffect } from 'react';
import { throttle } from 'radash';

const hasBackgroundImageUrl = (el) => {
  const style = window.getComputedStyle(el);
  const bg = style.backgroundImage || '';
  return bg.includes('url(');
};

const useCursor = (publishCursorUpdate, whiteboardId) => {
  const [cursorPosition, setCursorPosition] = useState({ x: '', y: '' });

  const updateCursorPosition = (newX, newY) => {
    setCursorPosition({ x: newX, y: newY });
  };

  useEffect(() => {
    if (!cursorPosition || cursorPosition.x === '' || cursorPosition.y === '') {
      return;
    }
    publishCursorUpdate({
      whiteboardId,
      xPercent: cursorPosition?.x,
      yPercent: cursorPosition?.y,
    });
  }, [cursorPosition, publishCursorUpdate, whiteboardId]);

  return [cursorPosition, updateCursorPosition];
};

const getPresentationOptionsMenuItem = () => document.querySelector('li#presentationFullscreen')
    || document.querySelector('li#presentationSnapshot')
    || document.querySelector('li#toolVisibility')
    || null;

const getTldrawOpenMenu = () => {
  const tlElement = document.querySelectorAll('[id^=radix-]');
  const tldrawMenu = Array.from(tlElement).find((el) => {
    const menuClasses = ['tlui-popover__content', 'tlui-menu'];
    if (el && menuClasses.includes(el.className)) {
      return el;
    }
    return false;
  });
  return tldrawMenu;
};

const useMouseEvents = ({
  whiteboardRef, tlEditorRef, isWheelZoomRef, initialZoomRef, isPresenterRef,
}, {
  hasWBAccess,
  whiteboardToolbarAutoHide,
  animations,
  updateCursorPosition,
  toggleToolsAnimations,
  currentPresentationPage,
  zoomChanger,
  setIsMouseDown,
  setIsWheelZoom,
  setWheelZoomTimeout,
  isInfiniteWhiteboard,
}) => {
  const timeoutIdRef = React.useRef();
  const fingerCountRef = React.useRef(0);
  const initialPinchDistanceRef = React.useRef(0);
  const isPinchingRef = React.useRef(false);
  const mouseLeaveTimeoutRef = React.useRef();
  const PINCH_THRESHOLD = 10;

  const getDistanceBetweenTouches = (touch1, touch2) => {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleMouseUp = () => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }

    timeoutIdRef.current = setTimeout(() => {
      setIsMouseDown(false);
    }, 1000);

    tlEditorRef?.current?.updateInstanceState({ canMoveCamera: true, isReadonly: false });
  };

  const handleMouseDownWhiteboard = (event) => {
    if (!isPresenterRef.current && !hasWBAccess) {
      const updateProps = { isReadonly: false };

      if (event.button === 1) {
        updateProps.canMoveCamera = false;
      }

      tlEditorRef?.current?.updateInstanceState(updateProps);
    }

    setIsMouseDown(true);
  };

  const handleMouseDownWindow = (event) => {
    const { target } = event;
    const editor = tlEditorRef.current;
    const presentationInnerWrapper = document.getElementById('presentationInnerWrapper');

    if (!(presentationInnerWrapper && presentationInnerWrapper.contains(target))) {
      if (editor?.getEditingShape()) {
        return editor.complete();
      }
    }

    const selectedShapes = editor?.getSelectedShapes();
    if (
      selectedShapes?.length === 1
      && selectedShapes[0].type === 'frame'
      && editor?.getCurrentToolId() === 'select'
      && !target.matches('[data-testid*="selection.resize"]')
      && !target.matches('[data-testid*="selection.target"]')
      && hasBackgroundImageUrl(target)
    ) {
      editor.selectNone();
      return editor.complete();
    }

    return undefined;
  };

  const handleMouseEnter = () => {
    clearTimeout(mouseLeaveTimeoutRef.current);
    if (whiteboardToolbarAutoHide) {
      toggleToolsAnimations(
        'fade-out',
        'fade-in',
        animations ? '.3s' : '0s',
        hasWBAccess || isPresenterRef.current,
      );
    }
  };

  const handleMouseLeave = () => {
    if (whiteboardToolbarAutoHide) {
      clearTimeout(mouseLeaveTimeoutRef.current);
      const presentationWBOptionsMenuItem = getPresentationOptionsMenuItem();
      const tldrawMenu = getTldrawOpenMenu();
      if (presentationWBOptionsMenuItem || tldrawMenu) {
        if (tldrawMenu) {
          mouseLeaveTimeoutRef.current = setTimeout(() => {
            handleMouseLeave();
          }, 500);
        } else if (presentationWBOptionsMenuItem) {
          const ulElement = presentationWBOptionsMenuItem.parentElement;
          const menuWrapper = ulElement.parentElement;
          const isVisible = menuWrapper.style.visibility !== 'hidden';
          if (isVisible) {
            mouseLeaveTimeoutRef.current = setTimeout(() => {
              handleMouseLeave();
            }, 500);
          } else {
            toggleToolsAnimations(
              'fade-in',
              'fade-out',
              animations ? '3s' : '0s',
              hasWBAccess || isPresenterRef.current,
            );
          }
        } else {
          toggleToolsAnimations(
            'fade-in',
            'fade-out',
            animations ? '3s' : '0s',
            hasWBAccess || isPresenterRef.current,
          );
        }
      }
    }

    setTimeout(() => {
      updateCursorPosition(-1, -1);
    }, 150);
  };

  useEffect(() => () => clearTimeout(mouseLeaveTimeoutRef.current), []);

  const handleMouseWheel = throttle({ interval: 175 }, (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!tlEditorRef.current || !isPresenterRef.current || !currentPresentationPage) {
      return;
    }

    setIsWheelZoom(true);

    const MAX_ZOOM_FACTOR = 4; // Represents 400%
    const MIN_ZOOM_FACTOR = isInfiniteWhiteboard ? 0.25 : 1;
    const ZOOM_IN_FACTOR = 0.25;
    const ZOOM_OUT_FACTOR = 0.25;

    // Get the current mouse position
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    // Get the current camera position and zoom level
    const { x: cx, y: cy, z: cz } = tlEditorRef.current.getCamera();

    let currentZoomLevel = cz / initialZoomRef.current;
    if (event.deltaY < 0) {
      currentZoomLevel = Math.min(currentZoomLevel + ZOOM_IN_FACTOR, MAX_ZOOM_FACTOR);
    } else {
      currentZoomLevel = Math.max(currentZoomLevel - ZOOM_OUT_FACTOR, MIN_ZOOM_FACTOR);
    }

    // Convert zoom level to a percentage for backend
    const zoomPercentage = currentZoomLevel * 100;
    zoomChanger(zoomPercentage);

    // Calculate the new camera zoom factor
    const newCameraZoomFactor = currentZoomLevel * initialZoomRef.current;

    // Calculate the mouse position in canvas space using whiteboardRef
    const rect = whiteboardRef.current?.getBoundingClientRect();
    const canvasMouseX = (mouseX - (rect?.left || 0)) / cz + cx;
    const canvasMouseY = (mouseY - (rect?.top || 0)) / cz + cy;

    // Calculate the new camera position to keep the mouse position under the cursor
    const nextCamera = {
      x: canvasMouseX - (canvasMouseX - cx) * (newCameraZoomFactor / cz),
      y: canvasMouseY - (canvasMouseY - cy) * (newCameraZoomFactor / cz),
      z: newCameraZoomFactor,
    };

    tlEditorRef.current.setCamera(nextCamera, { duration: 175 });

    if (isWheelZoomRef.currentTimeout) {
      clearTimeout(isWheelZoomRef.currentTimeout);
    }

    setWheelZoomTimeout();
  });

  const handleTouchStart = (event) => {
    if (event.touches.length === 2) {
      fingerCountRef.current = 2;
      isPinchingRef.current = false;
      const [t1, t2] = event.touches;
      initialPinchDistanceRef.current = getDistanceBetweenTouches(t1, t2);
    } else if (event.touches.length === 3) {
      fingerCountRef.current = 3;
    } else {
      fingerCountRef.current = 0;
    }
  };

  const handleTouchMove = (event) => {
    if (fingerCountRef.current === 2 && event.touches.length === 2) {
      const [t1, t2] = event.touches;
      const currentDistance = getDistanceBetweenTouches(t1, t2);
      const distanceDiff = Math.abs(currentDistance - initialPinchDistanceRef.current);
      if (distanceDiff > PINCH_THRESHOLD) {
        isPinchingRef.current = true;
      }
    }
  };

  const handleTouchEnd = (event) => {
    if (event.touches.length === 0) {
      const count = fingerCountRef.current;

      if (!hasWBAccess) return;

      if (count === 2) {
        if (!isPinchingRef.current) {
          tlEditorRef.current?.undo();
        }
      } else if (count === 3) {
        tlEditorRef.current?.redo();
      }
      fingerCountRef.current = 0;
      isPinchingRef.current = false;
      initialPinchDistanceRef.current = 0;
    }
  };

  React.useEffect(() => {
    if (whiteboardToolbarAutoHide) {
      toggleToolsAnimations(
        'fade-in',
        'fade-out',
        animations ? '3s' : '0s',
        hasWBAccess || isPresenterRef.current,
      );
    } else {
      toggleToolsAnimations(
        'fade-out',
        'fade-in',
        animations ? '.3s' : '0s',
        hasWBAccess || isPresenterRef.current,
      );
    }
  }, [whiteboardToolbarAutoHide]);

  React.useEffect(() => {
    const presentationWrapper = document.getElementById('presentationInnerWrapper');
    window.addEventListener('mousedown', handleMouseDownWindow);
    if (presentationWrapper) {
      presentationWrapper.addEventListener('mousedown', handleMouseDownWhiteboard);
      presentationWrapper.addEventListener('mouseup', handleMouseUp);
      presentationWrapper.addEventListener('mouseenter', handleMouseEnter);
      presentationWrapper.addEventListener('mouseleave', handleMouseLeave);
      presentationWrapper.addEventListener('wheel', handleMouseWheel, { passive: false, capture: true });
      presentationWrapper.addEventListener('touchstart', handleTouchStart, { passive: false, capture: true });
      presentationWrapper.addEventListener('touchend', handleTouchEnd, { passive: false, capture: true });
      presentationWrapper.addEventListener('touchmove', handleTouchMove, { passive: false });
    }

    return () => {
      if (presentationWrapper) {
        presentationWrapper.removeEventListener('mousedown', handleMouseDownWhiteboard);
        presentationWrapper.removeEventListener('mouseup', handleMouseUp);
        presentationWrapper.removeEventListener('mouseenter', handleMouseEnter);
        presentationWrapper.removeEventListener('mouseleave', handleMouseLeave);
        presentationWrapper.removeEventListener('wheel', handleMouseWheel);
        presentationWrapper.removeEventListener('touchstart', handleTouchStart);
        presentationWrapper.removeEventListener('touchend', handleTouchEnd);
        presentationWrapper.removeEventListener('touchmove', handleTouchMove);
      }
      window.removeEventListener('mousedown', handleMouseDownWindow);
    };
  }, [
    tlEditorRef,
    isPresenterRef,
    handleMouseDownWhiteboard,
    handleMouseUp,
    handleMouseEnter,
    handleMouseLeave,
    handleMouseWheel,
  ]);
};

export {
  useMouseEvents,
  useCursor,
};
