import React, { useEffect } from 'react';
import { throttle } from 'radash';

const hasBackgroundImageUrl = (el) => {
  const style = window.getComputedStyle(el);
  const bg = style.backgroundImage || '';
  return bg.includes('url(');
};

const useCursor = (publishCursorUpdate, whiteboardId) => {
  const publishRef = React.useRef(publishCursorUpdate);
  const whiteboardIdRef = React.useRef(whiteboardId);
  const pendingRef = React.useRef(null);
  const rafRef = React.useRef(null);

  useEffect(() => { publishRef.current = publishCursorUpdate; }, [publishCursorUpdate]);
  useEffect(() => { whiteboardIdRef.current = whiteboardId; }, [whiteboardId]);

  useEffect(() => () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      if (pendingRef.current) {
        publishRef.current({
          whiteboardId: whiteboardIdRef.current,
          ...pendingRef.current,
        });
        pendingRef.current = null;
      }
    }
  }, []);

  const updateCursorPosition = React.useCallback((newX, newY) => {
    if (newX === undefined || newX === null || newY === undefined || newY === null) return;
    pendingRef.current = { xPercent: newX, yPercent: newY };
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        if (pendingRef.current) {
          publishRef.current({
            whiteboardId: whiteboardIdRef.current,
            ...pendingRef.current,
          });
          pendingRef.current = null;
        }
      });
    }
  }, []);

  return updateCursorPosition;
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
  whiteboardRef, tlEditorRef, isWheelZoomRef, isTouchZoomRef, initialZoomRef, isPresenterRef,
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
  const touchGestureRef = React.useRef(null);
  const mouseLeaveTimeoutRef = React.useRef();
  const touchZoomResetTimeoutRef = React.useRef();
  const PINCH_THRESHOLD = 10;
  const PAN_THRESHOLD = 8;
  // Outlives zoomChanger's 200 ms debounce, so the zoom effect still skips its camera sync.
  const TOUCH_GESTURE_SETTLE_MS = 300;

  const getDistanceBetweenTouches = (touch1, touch2) => {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchMidpoint = (touch1, touch2) => ({
    x: (touch1.clientX + touch2.clientX) / 2,
    y: (touch1.clientY + touch2.clientY) / 2,
  });

  const setIsTouchZoom = (value) => {
    // eslint-disable-next-line no-param-reassign
    isTouchZoomRef.current = value;
  };

  const resetTouchZoomAfterCameraSettles = () => {
    clearTimeout(touchZoomResetTimeoutRef.current);
    touchZoomResetTimeoutRef.current = setTimeout(() => {
      setIsTouchZoom(false);
    }, TOUCH_GESTURE_SETTLE_MS);
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

  useEffect(() => () => {
    clearTimeout(mouseLeaveTimeoutRef.current);
    clearTimeout(touchZoomResetTimeoutRef.current);
  }, []);

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

    const wheelZoomRequiresCtrl = window.meetingClientSettings.public.whiteboard
      .wheelZoomRequiresCtrl ?? true;

    // Check if user wants to zoom (Ctrl/Cmd key pressed, or wheel zooms directly)
    if (!wheelZoomRequiresCtrl || event.ctrlKey || event.metaKey) {
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
        x: cx + (canvasMouseX - cx) * (cz / newCameraZoomFactor - 1),
        y: cy + (canvasMouseY - cy) * (cz / newCameraZoomFactor - 1),
        z: newCameraZoomFactor,
      };

      tlEditorRef.current.setCamera(nextCamera, { duration: 175 });
    } else {
      // Default behavior: Scroll (Pan vertically)
      const panFactor = 2.5; // Scroll speed multiplier

      const panAmount = -(event.deltaY * panFactor) / cz;

      const nextCamera = {
        x: cx,
        y: cy + panAmount,
        z: cz,
      };

      tlEditorRef.current.setCamera(nextCamera, { duration: 175 });
    }

    if (isWheelZoomRef.currentTimeout) {
      clearTimeout(isWheelZoomRef.currentTimeout);
    }

    setWheelZoomTimeout();
  });

  const isSecondaryTouchPointer = (event) => !event.isPrimary && event.pointerType === 'touch';

  // tldraw (use-gesture) starts its own pinch on the second pointerdown it sees, so no
  // second touch pointer may reach it: the presenter's pinch is handled in handleTouchMove.
  const handlePointerDown = (event) => {
    if (!isSecondaryTouchPointer(event)) return;
    event.stopPropagation();
    const editor = tlEditorRef.current;
    if (!editor || editor.getInstanceState().isPenMode) return;
    // End what the first finger started; an idle tool would switch to select on cancel.
    const isBusy = () => {
      const path = editor.getPath();
      return path.includes('.') && !path.endsWith('.idle') && path !== 'select.editing_shape';
    };
    if (isBusy()) {
      editor.interrupt();
      if (isBusy()) editor.complete();
    }
  };

  const handleSecondaryPointer = (event) => {
    if (isSecondaryTouchPointer(event)) event.stopPropagation();
  };

  const handleTouchStart = (event) => {
    if (event.touches.length === 2) {
      clearTimeout(touchZoomResetTimeoutRef.current);
      fingerCountRef.current = 2;
      isPinchingRef.current = false;
      const [t1, t2] = event.touches;
      initialPinchDistanceRef.current = getDistanceBetweenTouches(t1, t2);
      touchGestureRef.current = null;
      if (!isPresenterRef.current) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      const camera = tlEditorRef.current?.getCamera();
      if (!camera) return;
      setIsTouchZoom(true);
      const midpoint = getTouchMidpoint(t1, t2);
      touchGestureRef.current = {
        active: false,
        startZ: camera.z,
        startDistance: initialPinchDistanceRef.current,
        startMidpoint: midpoint,
        previousMidpoint: midpoint,
      };
    } else if (event.touches.length === 3) {
      fingerCountRef.current = 3;
      touchGestureRef.current = null;
    } else {
      fingerCountRef.current = 0;
      touchGestureRef.current = null;
    }
  };

  const handleTouchMove = (event) => {
    if (fingerCountRef.current !== 2 || event.touches.length !== 2) return;
    const [t1, t2] = event.touches;
    const distance = getDistanceBetweenTouches(t1, t2);
    if (Math.abs(distance - initialPinchDistanceRef.current) > PINCH_THRESHOLD) {
      isPinchingRef.current = true;
    }

    const gesture = touchGestureRef.current;
    const editor = tlEditorRef.current;
    const baseZoom = initialZoomRef.current;
    if (
      !gesture
      || !editor
      || !isPresenterRef.current
      || !currentPresentationPage
      || !(baseZoom > 0)
    ) {
      return;
    }

    const midpoint = getTouchMidpoint(t1, t2);
    if (!gesture.active) {
      const moved = Math.hypot(
        midpoint.x - gesture.startMidpoint.x,
        midpoint.y - gesture.startMidpoint.y,
      );
      if (Math.abs(distance - gesture.startDistance) <= PINCH_THRESHOLD && moved <= PAN_THRESHOLD) {
        return;
      }
      // Start from here, so the view does not jump by the threshold.
      gesture.active = true;
      gesture.startDistance = distance;
      gesture.startZ = editor.getCamera().z;
      gesture.previousMidpoint = midpoint;
      isPinchingRef.current = true;
      editor.stopCameraAnimation();
      return;
    }
    if (event.cancelable) event.preventDefault();

    const MAX_ZOOM_FACTOR = 4;
    const MIN_ZOOM_FACTOR = isInfiniteWhiteboard ? 0.25 : 1;
    // Two touches reported at the same point: no distance to zoom from yet.
    if (!(gesture.startDistance > 0)) {
      gesture.startDistance = distance;
      return;
    }
    const { x: cx, y: cy, z: cz } = editor.getCamera();
    const bounds = editor.getViewportScreenBounds();
    const pinchZoom = gesture.startZ * (distance / gesture.startDistance);
    const nz = Math.min(
      MAX_ZOOM_FACTOR * baseZoom,
      Math.max(MIN_ZOOM_FACTOR * baseZoom, pinchZoom),
    );
    if (nz !== pinchZoom) {
      // At a bound: zoom back as soon as the fingers turn round.
      gesture.startZ = nz;
      gesture.startDistance = distance;
    }

    // Keep the page point under the fingers under them (page = screen / z - camera); the
    // store's onBeforeChange keeps the slide in view.
    const previous = gesture.previousMidpoint;
    gesture.previousMidpoint = midpoint;
    editor.setCamera({
      x: cx + (midpoint.x - bounds.x) / nz - (previous.x - bounds.x) / cz,
      y: cy + (midpoint.y - bounds.y) / nz - (previous.y - bounds.y) / cz,
      z: nz,
    });
    zoomChanger((nz / baseZoom) * 100);

    // The cursor the others see follows the point between the fingers, not the first finger.
    const { x: nx, y: ny } = editor.getCamera();
    updateCursorPosition((midpoint.x - bounds.x) / nz - nx, (midpoint.y - bounds.y) / nz - ny);
  };

  const handleTouchEnd = (event) => {
    if (event.touches.length < 2) {
      touchGestureRef.current = null;
      resetTouchZoomAfterCameraSettles();
    }

    if (event.touches.length === 0) {
      const count = fingerCountRef.current;

      if (!hasWBAccess && !isPresenterRef.current) return;

      if (count === 2) {
        if (!isPinchingRef.current && hasWBAccess) {
          tlEditorRef.current?.undo();
        }
      } else if (count === 3 && hasWBAccess) {
        tlEditorRef.current?.redo();
      }
      fingerCountRef.current = 0;
      isPinchingRef.current = false;
      initialPinchDistanceRef.current = 0;
    }
  };

  const handleTouchCancel = () => {
    fingerCountRef.current = 0;
    isPinchingRef.current = false;
    initialPinchDistanceRef.current = 0;
    touchGestureRef.current = null;
    resetTouchZoomAfterCameraSettles();
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
      presentationWrapper.addEventListener('pointerdown', handlePointerDown, { capture: true });
      presentationWrapper.addEventListener('pointermove', handleSecondaryPointer, { capture: true });
      presentationWrapper.addEventListener('pointerup', handleSecondaryPointer, { capture: true });
      presentationWrapper.addEventListener('pointercancel', handleSecondaryPointer, { capture: true });
      presentationWrapper.addEventListener('touchstart', handleTouchStart, { passive: false, capture: true });
      presentationWrapper.addEventListener('touchend', handleTouchEnd, { passive: false, capture: true });
      presentationWrapper.addEventListener('touchcancel', handleTouchCancel, { passive: false, capture: true });
      presentationWrapper.addEventListener('touchmove', handleTouchMove, { passive: false });
    }

    return () => {
      if (presentationWrapper) {
        presentationWrapper.removeEventListener('mousedown', handleMouseDownWhiteboard);
        presentationWrapper.removeEventListener('mouseup', handleMouseUp);
        presentationWrapper.removeEventListener('mouseenter', handleMouseEnter);
        presentationWrapper.removeEventListener('mouseleave', handleMouseLeave);
        presentationWrapper.removeEventListener('wheel', handleMouseWheel, { capture: true });
        presentationWrapper.removeEventListener('pointerdown', handlePointerDown, { capture: true });
        presentationWrapper.removeEventListener('pointermove', handleSecondaryPointer, { capture: true });
        presentationWrapper.removeEventListener('pointerup', handleSecondaryPointer, { capture: true });
        presentationWrapper.removeEventListener('pointercancel', handleSecondaryPointer, { capture: true });
        presentationWrapper.removeEventListener('touchstart', handleTouchStart, { capture: true });
        presentationWrapper.removeEventListener('touchend', handleTouchEnd, { capture: true });
        presentationWrapper.removeEventListener('touchcancel', handleTouchCancel, { capture: true });
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
