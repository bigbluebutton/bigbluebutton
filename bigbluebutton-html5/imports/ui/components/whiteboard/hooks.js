import React, { useState, useEffect } from 'react';
import { throttle } from 'radash';

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

const useMouseEvents = ({ whiteboardRef, tlEditorRef, isWheelZoomRef, initialZoomRef }, {
    isPresenter,
    hasWBAccess,
    whiteboardToolbarAutoHide,
    animations,
    cursorPosition,
    updateCursorPosition,
    toggleToolsAnimations,
    currentPresentationPage,
    zoomChanger,
    setIsMouseDown,
    setIsWheelZoom,
    setWheelZoomTimeout,
}) => {

    const timeoutIdRef = React.useRef();

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
        if (!isPresenter && !hasWBAccess) {
            let updateProps = { isReadonly: false };

            if (event.button === 1) {
                updateProps.canMoveCamera = false;
            }

            tlEditorRef?.current?.updateInstanceState(updateProps);
        }

        setIsMouseDown(true);
    };

    const handleMouseDownWindow = (event) => {
        const presentationInnerWrapper = document.getElementById('presentationInnerWrapper');
        if (!(presentationInnerWrapper && presentationInnerWrapper.contains(event.target))) {
          const editingShape = tlEditorRef.current?.getEditingShape();
          if (editingShape) {
            return tlEditorRef.current?.setEditingShape(null);
          }
        }
        return undefined;
    };

    const handleMouseEnter = () => {
        if (whiteboardToolbarAutoHide) {
            toggleToolsAnimations(
                "fade-out",
                "fade-in",
                animations ? ".3s" : "0s",
                hasWBAccess || isPresenter
            );
        }
    };

    const handleMouseLeave = () => {
        if (whiteboardToolbarAutoHide) {
            toggleToolsAnimations(
                "fade-in",
                "fade-out",
                animations ? "3s" : "0s",
                hasWBAccess || isPresenter
            );
        }

        setTimeout(() => {
            updateCursorPosition(-1, -1);
        }, 150);
    };

    const handleMouseWheel = throttle({ interval: 175 }, (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!tlEditorRef.current || !isPresenter || !currentPresentationPage) {
            return;
        }

        setIsWheelZoom(true);

        const MAX_ZOOM_FACTOR = 4; // Represents 400%
        const MIN_ZOOM_FACTOR = 1; // Represents 100%
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
        const rect = whiteboardRef.current.getBoundingClientRect();
        const canvasMouseX = (mouseX - rect.left) / cz + cx;
        const canvasMouseY = (mouseY - rect.top) / cz + cy;

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

    React.useEffect(() => {
        if (whiteboardToolbarAutoHide) {
            toggleToolsAnimations(
                "fade-in",
                "fade-out",
                animations ? "3s" : "0s",
                hasWBAccess || isPresenter
            );
        } else {
            toggleToolsAnimations(
                "fade-out",
                "fade-in",
                animations ? ".3s" : "0s",
                hasWBAccess || isPresenter
            );
        }
    }, [whiteboardToolbarAutoHide]);

    React.useEffect(() => {
        const whiteboardElement = whiteboardRef.current;

        window.addEventListener('mousedown', handleMouseDownWindow);

        if (whiteboardElement) {
            whiteboardElement.addEventListener("mousedown", handleMouseDownWhiteboard);
            whiteboardElement.addEventListener("mouseup", handleMouseUp);
            whiteboardElement.addEventListener("mouseenter", handleMouseEnter);
            whiteboardElement.addEventListener("mouseleave", handleMouseLeave);
            whiteboardElement.addEventListener("wheel", handleMouseWheel, { passive: false, capture: true });
        }

        return () => {
            if (whiteboardElement) {
                whiteboardElement.removeEventListener("mousedown", handleMouseDownWhiteboard);
                whiteboardElement.removeEventListener("mouseup", handleMouseUp);
                whiteboardElement.removeEventListener("mouseenter", handleMouseEnter);
                whiteboardElement.removeEventListener("mouseleave", handleMouseLeave);
                whiteboardElement.removeEventListener("wheel", handleMouseWheel);
            }

            window.removeEventListener('mousedown', handleMouseDownWindow);
        };
    }, [
        whiteboardRef,
        tlEditorRef,
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
