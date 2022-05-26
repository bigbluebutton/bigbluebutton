import React, { useState, useEffect } from 'react';
import Resizable from 're-resizable';
import Draggable from 'react-draggable';
import Styled from './styles';
import { ACTIONS, CAMERADOCK_POSITION } from '../layout/enums';
import DropAreaContainer from './drop-areas/container';
import VideoProviderContainer from '/imports/ui/components/video-provider/container';
import Storage from '/imports/ui/services/storage/session';
import { colorContentBackground } from '/imports/ui/stylesheets/styled-components/palette';

const WebcamComponent = ({
  cameraDock,
  swapLayout,
  layoutContextDispatch,
  fullscreen,
  isPresenter,
  displayPresentation,
  cameraOptimalGridSize: cameraSize,
  isRTL,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullScreen] = useState(false);
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0 });
  const [cameraMaxWidth, setCameraMaxWidth] = useState(0);
  const [draggedAtLeastOneTime, setDraggedAtLeastOneTime] = useState(false);

  const lastSize = Storage.getItem('webcamSize') || { width: 0, height: 0 };
  const { width: lastWidth, height: lastHeight } = lastSize;

  const isCameraTopOrBottom = cameraDock.position === CAMERADOCK_POSITION.CONTENT_TOP
    || cameraDock.position === CAMERADOCK_POSITION.CONTENT_BOTTOM;
  const isCameraLeftOrRight = cameraDock.position === CAMERADOCK_POSITION.CONTENT_LEFT
    || cameraDock.position === CAMERADOCK_POSITION.CONTENT_RIGHT;
  const isCameraSidebar = cameraDock.position === CAMERADOCK_POSITION.SIDEBAR_CONTENT_BOTTOM;

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  useEffect(() => {
    setIsFullScreen(fullscreen.group === 'webcams');
  }, [fullscreen]);

  useEffect(() => {
    if (isCameraTopOrBottom && lastHeight > 0) {
      layoutContextDispatch(
        {
          type: ACTIONS.SET_CAMERA_DOCK_SIZE,
          value: {
            width: cameraDock.width,
            height: lastHeight,
            browserWidth: window.innerWidth,
            browserHeight: window.innerHeight,
          },
        },
      );
    }
    if (isCameraLeftOrRight && lastWidth > 0) {
      layoutContextDispatch(
        {
          type: ACTIONS.SET_CAMERA_DOCK_SIZE,
          value: {
            width: lastWidth,
            height: cameraDock.height,
            browserWidth: window.innerWidth,
            browserHeight: window.innerHeight,
          },
        },
      );
    }
  }, [cameraDock.position, lastWidth, lastHeight]);

  useEffect(() => {
    const newCameraMaxWidth = (isPresenter && cameraDock.presenterMaxWidth) ? cameraDock.presenterMaxWidth : cameraDock.maxWidth;
    setCameraMaxWidth(newCameraMaxWidth);

    if (isCameraLeftOrRight && cameraDock.width > newCameraMaxWidth) {
      layoutContextDispatch(
        {
          type: ACTIONS.SET_CAMERA_DOCK_SIZE,
          value: {
            width: newCameraMaxWidth,
            height: cameraDock.height,
            browserWidth: window.innerWidth,
            browserHeight: window.innerHeight,
          },
        },
      );
      Storage.setItem('webcamSize', { width: newCameraMaxWidth, height: lastHeight });
    }
  }, [cameraDock.position, cameraDock.maxWidth, isPresenter, displayPresentation]);

  const onResizeHandle = (deltaWidth, deltaHeight) => {
    if (cameraDock.resizableEdge.top || cameraDock.resizableEdge.bottom) {
      layoutContextDispatch(
        {
          type: ACTIONS.SET_CAMERA_DOCK_SIZE,
          value: {
            width: cameraDock.width,
            height: resizeStart.height + deltaHeight,
            browserWidth: window.innerWidth,
            browserHeight: window.innerHeight,
          },
        },
      );
    }
    if (cameraDock.resizableEdge.left || cameraDock.resizableEdge.right) {
      layoutContextDispatch(
        {
          type: ACTIONS.SET_CAMERA_DOCK_SIZE,
          value: {
            width: resizeStart.width + deltaWidth,
            height: cameraDock.height,
            browserWidth: window.innerWidth,
            browserHeight: window.innerHeight,
          },
        },
      );
    }
  };

  const handleWebcamDragStart = () => {
    setIsDragging(true);
    document.body.style.overflow = 'hidden';
    layoutContextDispatch({
      type: ACTIONS.SET_CAMERA_DOCK_IS_DRAGGING,
      value: true,
    });
  };

  const handleWebcamDragStop = (e) => {
    setIsDragging(false);
    setDraggedAtLeastOneTime(false);
    document.body.style.overflow = 'auto';

    if (Object.values(CAMERADOCK_POSITION).includes(e.target.id) && draggedAtLeastOneTime) {
      layoutContextDispatch({
        type: ACTIONS.SET_CAMERA_DOCK_POSITION,
        value: e.target.id,
      });
    }

    layoutContextDispatch({
      type: ACTIONS.SET_CAMERA_DOCK_IS_DRAGGING,
      value: false,
    });
  };

  let draggableOffset = {
    left: isDragging && (isCameraTopOrBottom || isCameraSidebar)
      ? ((cameraDock.width - cameraSize.width) / 2)
      : 0,
    top: isDragging && isCameraLeftOrRight
      ? ((cameraDock.height - cameraSize.height) / 2)
      : 0,
  };

  if (isRTL) {
    draggableOffset.left = draggableOffset.left * -1;
  }

  return (
    <>
      {isDragging ? <DropAreaContainer /> : null}
      <Styled.ResizableWrapper
        horizontal={cameraDock.position === CAMERADOCK_POSITION.CONTENT_TOP
          || cameraDock.position === CAMERADOCK_POSITION.CONTENT_BOTTOM}
        vertical={cameraDock.position === CAMERADOCK_POSITION.CONTENT_LEFT
          || cameraDock.position === CAMERADOCK_POSITION.CONTENT_RIGHT}
      >
        <Draggable
          handle="video"
          bounds="html"
          onStart={handleWebcamDragStart}
          onDrag={() => {
            if (!draggedAtLeastOneTime) {
              setDraggedAtLeastOneTime(true);
            }
          }}
          onStop={handleWebcamDragStop}
          onMouseDown={
            cameraDock.isDraggable ? (e) => e.preventDefault() : undefined
          }
          disabled={!cameraDock.isDraggable || isResizing || isFullscreen}
          position={
            {
              x: cameraDock.left - cameraDock.right + draggableOffset.left,
              y: cameraDock.top + draggableOffset.top,
            }
          }
        >
          <Resizable
            minWidth={isDragging ? cameraSize.width : cameraDock.minWidth}
            minHeight={isDragging ? cameraSize.height : cameraDock.minHeight}
            maxWidth={isDragging ? cameraSize.width : cameraMaxWidth}
            size={{
              width: isDragging ? cameraSize.width : cameraDock.width,
              height: isDragging ? cameraSize.height : cameraDock.height,
            }}
            onResizeStart={() => {
              setIsResizing(true);
              setResizeStart({ width: cameraDock.width, height: cameraDock.height });
              layoutContextDispatch({
                type: ACTIONS.SET_CAMERA_DOCK_IS_RESIZING,
                value: true,
              });
            }}
            onResize={(e, direction, ref, d) => {
              onResizeHandle(d.width, d.height);
            }}
            onResizeStop={() => {
              if (isCameraTopOrBottom) {
                Storage.setItem('webcamSize', { width: lastWidth, height: cameraDock.height });
              }
              if (isCameraLeftOrRight) {
                Storage.setItem('webcamSize', { width: cameraDock.width, height: lastHeight });
              }
              setResizeStart({ width: 0, height: 0 });
              setTimeout(() => setIsResizing(false), 500);
              layoutContextDispatch({
                type: ACTIONS.SET_CAMERA_DOCK_IS_RESIZING,
                value: false,
              });
            }}
            enable={{
              top: !isFullscreen && !isDragging && !swapLayout && cameraDock.resizableEdge.top,
              bottom: !isFullscreen && !isDragging && !swapLayout && cameraDock.resizableEdge.bottom,
              left: !isFullscreen && !isDragging && !swapLayout && cameraDock.resizableEdge.left,
              right: !isFullscreen && !isDragging && !swapLayout && cameraDock.resizableEdge.right,
              topLeft: false,
              topRight: false,
              bottomLeft: false,
              bottomRight: false,
            }}
            style={{
              position: 'absolute',
              zIndex: cameraDock.zIndex,
            }}
          >
            <Styled.Draggable
              isDraggable={cameraDock.isDraggable && !isFullscreen && !isDragging}
              isDragging={isDragging}
              id="cameraDock"
              role="region"
              draggable={cameraDock.isDraggable && !isFullscreen ? 'true' : undefined}
              style={{
                width: isDragging ? cameraSize.width : cameraDock.width,
                height: isDragging ? cameraSize.height : cameraDock.height,
                opacity: isDragging ? 0.5 : undefined,
                background: isCameraSidebar ? colorContentBackground : null,
              }}
            >
              <VideoProviderContainer
                {...{
                  swapLayout,
                  cameraDock,
                }}
              />
            </Styled.Draggable>
          </Resizable>
        </Draggable>
      </Styled.ResizableWrapper>
    </>
  );
};

export default WebcamComponent;
