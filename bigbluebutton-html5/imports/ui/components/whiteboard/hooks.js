import React, { useState, useEffect, useRef } from 'react';

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

const useMouseEvents = ({ whiteboardRef, tlEditorRef }, {
    isPresenter,
    hasWBAccess,
    isMouseDownRef,
    whiteboardToolbarAutoHide,
    animations,
    publishCursorUpdate,
    whiteboardId,
    cursorPosition,
    updateCursorPosition,
    toggleToolsAnimations
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

        const MAX_ZOOM = 4;
        const MIN_ZOOM = .2;
        const ZOOM_IN_FACTOR = 0.100; // Finer zoom control
        const ZOOM_OUT_FACTOR = 0.100;

        const { x: cx, y: cy, z: cz } = tlEditorRef.current.camera;

        let zoom = cz;
        if (event.deltaY < 0) {
            // Zoom in
            zoom = Math.min(cz + ZOOM_IN_FACTOR, MAX_ZOOM);
        } else {
            // Zoom out
            zoom = Math.max(cz - ZOOM_OUT_FACTOR, MIN_ZOOM);
        }

        const { x, y } = { x: cursorPosition?.x, y: cursorPosition?.y };
        const nextCamera = {
            x: cx + (x / zoom - x) - (x / cz - x),
            y: cy + (y / zoom - y) - (y / cz - y),
            z: zoom,
        };

        tlEditorRef.current.setCamera(nextCamera, { duration: 300 });

        event.preventDefault();
        event.stopPropagation();
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
