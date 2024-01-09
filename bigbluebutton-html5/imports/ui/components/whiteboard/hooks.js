import React, { useState, useEffect, useRef } from 'react';
import SlideCalcUtil, {
    HUNDRED_PERCENT,
    MAX_PERCENT,
} from "/imports/utils/slideCalcUtils";

const useCursor = (publishCursorUpdate, whiteboardId) => {
    const [cursorPosition, setCursorPosition] = useState({ x: -1, y: -1 });

    const updateCursorPosition = (newX, newY) => {
        setCursorPosition({ x: newX, y: newY });
    };

    useEffect(() => {
        publishCursorUpdate({
            xPercent: cursorPosition?.x,
            yPercent: cursorPosition?.y,
            whiteboardId,
        });
    }, [cursorPosition, publishCursorUpdate, whiteboardId]);

    return [cursorPosition, updateCursorPosition];
};

const useMouseEvents = ({ whiteboardRef, tlEditorRef, isWheelZoomRef, initialZoomRef }, {
    isPresenter,
    hasWBAccess,
    isMouseDownRef,
    whiteboardToolbarAutoHide,
    animations,
    publishCursorUpdate,
    whiteboardId,
    cursorPosition,
    updateCursorPosition,
    toggleToolsAnimations,
    zoomChanger,
    presentationAreaWidth,
    presentationAreaHeight,
    calculateZoomValue,
    currentPresentationPage,
}) => {

    const timeoutIdRef = React.useRef();

    const handleMouseUp = () => {
        if (!isPresenter && !hasWBAccess) {
            tlEditorRef?.current?.updateInstanceState({ isReadonly: false });
        }

        if (timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current);
        }

        timeoutIdRef.current = setTimeout(() => {
            isMouseDownRef.current = false;
        }, 1000);
    };

    const handleMouseDown = () => {
        !isPresenter &&
            !hasWBAccess &&
            tlEditorRef?.current?.updateInstanceState({ isReadonly: true });

        isMouseDownRef.current = true;
    };

    const handleMouseEnter = () => {
        whiteboardToolbarAutoHide &&
            toggleToolsAnimations(
                "fade-out",
                "fade-in",
                animations ? ".3s" : "0s",
                hasWBAccess || isPresenter
            );
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


    const handleMouseWheel = (event) => {
        if (!tlEditorRef.current || !isPresenter) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        isWheelZoomRef.current = true;

        const MAX_ZOOM = 4;
        const MIN_ZOOM = initialZoomRef.current;
        const ZOOM_IN_FACTOR = 0.1; // Adjusted for finer control
        const ZOOM_OUT_FACTOR = 0.1;

        const { x: cx, y: cy, z: cz } = tlEditorRef.current.camera;

        let zoom = cz;
        if (event.deltaY < 0) {
            zoom = Math.min(cz + ZOOM_IN_FACTOR, MAX_ZOOM);
        } else {
            zoom = Math.max(cz - ZOOM_OUT_FACTOR, MIN_ZOOM);
        }

        // Base Zoom Calculation using the passed calculateZoomValue function
        const baseZoom = calculateZoomValue(
            currentPresentationPage.scaledWidth,
            currentPresentationPage.scaledHeight
        );

        // Apply aspect ratio adjustments
        const displayAspectRatio = presentationAreaWidth / presentationAreaHeight;
        const contentAspectRatio = currentPresentationPage.scaledWidth / currentPresentationPage.scaledHeight;

        if (contentAspectRatio > displayAspectRatio) {
            zoom *= contentAspectRatio / displayAspectRatio;
        } else {
            zoom *= displayAspectRatio / contentAspectRatio;
        }

        // Adjust zoom based on the base zoom calculation
        zoom *= baseZoom;

        const zoomRatio = zoom / initialZoomRef.current;
        const backendZoomValue = zoomRatio * 100;
        const adjustedBackendZoomValue = Math.min(Math.max(backendZoomValue, 100), 400);

        const nextCamera = {
            x: cx + (cursorPosition.x / zoom - cursorPosition.x) - (cursorPosition.x / cz - cursorPosition.x),
            y: cy + (cursorPosition.y / zoom - cursorPosition.y) - (cursorPosition.y / cz - cursorPosition.y),
            z: zoom,
        };

        // Apply the bounds restriction logic after the camera has been updated
        const { maxX, maxY, minX, minY } = tlEditorRef.current.viewportPageBounds;
        const { scaledWidth, scaledHeight } = currentPresentationPage;

        if (maxX > scaledWidth) {
            nextCamera.x += maxX - scaledWidth;
        }
        if (maxY > scaledHeight) {
            nextCamera.y += maxY - scaledHeight;
        }
        if (nextCamera.x > 0 || minX < 0) {
            nextCamera.x = 0;
        }
        if (nextCamera.y > 0 || minY < 0) {
            nextCamera.y = 0;
        }

        tlEditorRef.current.setCamera(nextCamera, { duration: 300 });

        event.preventDefault();
        event.stopPropagation();

        zoomChanger(adjustedBackendZoomValue);

        if (isWheelZoomRef.currentTimeout) {
            clearTimeout(isWheelZoomRef.currentTimeout);
        }

        isWheelZoomRef.currentTimeout = setTimeout(() => {
            isWheelZoomRef.current = false;
        }, 300);
    };


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

        if (whiteboardElement) {
            whiteboardElement.addEventListener("mousedown", handleMouseDown);
            whiteboardElement.addEventListener("mouseup", handleMouseUp);
            whiteboardElement.addEventListener("mouseenter", handleMouseEnter);
            whiteboardElement.addEventListener("mouseleave", handleMouseLeave);
            whiteboardElement.addEventListener("wheel", handleMouseWheel, { capture: true });
        }

        return () => {
            if (whiteboardElement) {
                whiteboardElement.removeEventListener("mousedown", handleMouseDown);
                whiteboardElement.removeEventListener("mouseup", handleMouseUp);
                whiteboardElement.removeEventListener("mouseenter", handleMouseEnter);
                whiteboardElement.removeEventListener("mouseleave", handleMouseLeave);
                whiteboardElement.removeEventListener("wheel", handleMouseWheel);
            }
        };
    }, [whiteboardRef, tlEditorRef, handleMouseDown, handleMouseUp, handleMouseEnter, handleMouseLeave, handleMouseWheel]);
};

export {
    useMouseEvents,
    useCursor,
};