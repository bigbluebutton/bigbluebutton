import React, { useState, useEffect, useRef } from 'react';
import {
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
    currentPresentationPage,
    zoomChanger,
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
        event.preventDefault();
        event.stopPropagation();
        if (!tlEditorRef.current || !isPresenter) {
            return;
        }

        isWheelZoomRef.current = true;

        const MAX_ZOOM_FACTOR = 4; // Represents 400%
        const MIN_ZOOM_FACTOR = 1; // Represents 100%
        const ZOOM_IN_FACTOR = 0.1;
        const ZOOM_OUT_FACTOR = 0.1;

        const { x: cx, y: cy, z: cz } = tlEditorRef.current.camera;

        let currentZoomLevel = tlEditorRef.current.camera.z / initialZoomRef.current;
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

        const nextCamera = {
            x: cx + (cursorPosition.x / newCameraZoomFactor - cursorPosition.x) - (cursorPosition.x / cz - cursorPosition.x),
            y: cy + (cursorPosition.y / newCameraZoomFactor - cursorPosition.y) - (cursorPosition.y / cz - cursorPosition.y),
            z: newCameraZoomFactor,
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
            whiteboardElement.addEventListener("wheel", handleMouseWheel, { passive: false, capture: true });
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
