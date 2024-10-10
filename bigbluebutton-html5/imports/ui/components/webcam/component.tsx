import React, { useState, useEffect } from 'react';
import Resizable from 're-resizable';
import Draggable, { DraggableEvent } from 'react-draggable';
import { useVideoStreams } from '/imports/ui/components/video-provider/hooks';
import {
  layoutSelect,
  layoutSelectInput,
  layoutSelectOutput,
  layoutDispatch,
} from '/imports/ui/components/layout/context';
import { LAYOUT_TYPE, ACTIONS, CAMERADOCK_POSITION } from '/imports/ui/components/layout/enums';
import { CURRENT_PRESENTATION_PAGE_SUBSCRIPTION } from '/imports/ui/components/whiteboard/queries';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import DropAreaContainer from './drop-areas/container';
import VideoProviderContainer from '/imports/ui/components/video-provider/container';
import Storage from '/imports/ui/services/storage/session';
import Styled from './styles';
import { Input, Layout, Output } from '/imports/ui/components/layout/layoutTypes';
import { VideoItem } from '/imports/ui/components/video-provider/types';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { useStorageKey } from '/imports/ui/services/storage/hooks';
import useSettings from '../../services/settings/hooks/useSettings';
import { SETTINGS } from '../../services/settings/enums';

interface WebcamComponentProps {
  cameraDock: Output['cameraDock'];
  swapLayout: boolean;
  focusedId: string;
  layoutContextDispatch: (...args: unknown[]) => void;
  fullscreen: Layout['fullscreen'];
  isPresenter: boolean;
  displayPresentation: boolean;
  cameraOptimalGridSize: Input['cameraDock']['cameraOptimalGridSize'];
  isRTL: boolean;
}

const WebcamComponent: React.FC<WebcamComponentProps> = ({
  cameraDock,
  swapLayout,
  focusedId,
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
  const { height: lastHeight } = lastSize as { width: number, height: number };

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
    const newCameraMaxWidth = (isPresenter && cameraDock.presenterMaxWidth)
      ? cameraDock.presenterMaxWidth
      : cameraDock.maxWidth;
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

    const cams = document.getElementById('cameraDock');
    cams?.setAttribute('data-position', cameraDock.position);
  }, [cameraDock.position, cameraDock.maxWidth, isPresenter, displayPresentation]);

  const handleVideoFocus = (id: string) => {
    layoutContextDispatch({
      type: ACTIONS.SET_FOCUSED_CAMERA_ID,
      value: focusedId !== id ? id : false,
    });
  };

  const onResizeHandle = (deltaWidth: number, deltaHeight: number) => {
    if (cameraDock.resizableEdge?.top || cameraDock.resizableEdge?.bottom) {
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
    if (cameraDock.resizableEdge?.left || cameraDock.resizableEdge?.right) {
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

  const handleWebcamDragStop = (e: DraggableEvent) => {
    setIsDragging(false);
    setDraggedAtLeastOneTime(false);
    document.body.style.overflow = 'auto';
    const dropAreaId = (e.target as HTMLDivElement).id;

    if (Object.values(CAMERADOCK_POSITION).includes(dropAreaId) && draggedAtLeastOneTime) {
      const layout = document.getElementById('layout');
      layout?.setAttribute('data-cam-position', dropAreaId);

      layoutContextDispatch({
        type: ACTIONS.SET_CAMERA_DOCK_POSITION,
        value: dropAreaId,
      });
    }

    layoutContextDispatch({
      type: ACTIONS.SET_CAMERA_DOCK_IS_DRAGGING,
      value: false,
    });
  };

  const draggableOffset = {
    left: isDragging && (isCameraTopOrBottom || isCameraSidebar)
      ? ((cameraDock.width - (cameraSize?.width ?? 0)) / 2)
      : 0,
    top: isDragging && isCameraLeftOrRight
      ? ((cameraDock.height - (cameraSize?.height ?? 0)) / 2)
      : 0,
  };

  if (isRTL) {
    draggableOffset.left *= -1;
  }

  const isIphone = !!(navigator.userAgent.match(/iPhone/i));
  const mobileWidth = `${isDragging ? cameraSize?.width : cameraDock.width}pt`;
  const mobileHeight = `${isDragging ? cameraSize?.height : cameraDock.height}pt`;
  const isDesktopWidth = isDragging ? cameraSize?.width : cameraDock.width;
  const isDesktopHeight = isDragging ? cameraSize?.height : cameraDock.height;
  const camOpacity = isDragging ? 0.5 : undefined;

  return (
    <>
      {isDragging ? <DropAreaContainer /> : null}
      <Styled.ResizableWrapper
        $horizontal={cameraDock.position === CAMERADOCK_POSITION.CONTENT_TOP
          || cameraDock.position === CAMERADOCK_POSITION.CONTENT_BOTTOM}
        $vertical={cameraDock.position === CAMERADOCK_POSITION.CONTENT_LEFT
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
            minWidth={isDragging ? cameraSize?.width : cameraDock.minWidth}
            minHeight={isDragging ? cameraSize?.height : cameraDock.minHeight}
            maxWidth={isDragging ? cameraSize?.width : cameraMaxWidth}
            maxHeight={isDragging ? cameraSize?.height : cameraDock.maxHeight}
            size={{
              width: isDragging ? cameraSize?.width : cameraDock.width,
              height: isDragging ? cameraSize?.height : cameraDock.height,
            }}
            onResizeStart={() => {
              setIsResizing(true);
              setResizeStart({ width: cameraDock.width, height: cameraDock.height });
              onResizeHandle(cameraDock.width, cameraDock.height);
              layoutContextDispatch({
                type: ACTIONS.SET_CAMERA_DOCK_IS_RESIZING,
                value: true,
              });
            }}
            onResize={(_, __, ___, d) => {
              onResizeHandle(d.width, d.height);
            }}
            onResizeStop={() => {
              setResizeStart({ width: 0, height: 0 });
              setTimeout(() => setIsResizing(false), 500);
              layoutContextDispatch({
                type: ACTIONS.SET_CAMERA_DOCK_IS_RESIZING,
                value: false,
              });
            }}
            enable={{
              top: !isFullscreen && !isDragging && !swapLayout && cameraDock?.resizableEdge?.top,
              bottom: !isFullscreen && !isDragging && !swapLayout
              && cameraDock?.resizableEdge?.bottom,
              left: !isFullscreen && !isDragging && !swapLayout && cameraDock?.resizableEdge?.left,
              right: !isFullscreen && !isDragging && !swapLayout && cameraDock?.resizableEdge?.right,
              topLeft: false,
              topRight: false,
              bottomLeft: false,
              bottomRight: false,
            }}
            style={{
              position: 'absolute',
              zIndex: isCameraSidebar && !isDragging ? 0 : cameraDock?.zIndex,
            }}
          >
            <Styled.Draggable
              $isDraggable={!!cameraDock.isDraggable && !isFullscreen && !isDragging}
              $isDragging={isDragging}
              id="cameraDock"
              role="region"
              draggable={cameraDock.isDraggable && !isFullscreen ? 'true' : undefined}
              style={{
                width: isIphone ? mobileWidth : isDesktopWidth,
                height: isIphone ? mobileHeight : isDesktopHeight,
                opacity: camOpacity,
                background: 'none',
              }}
            >
              <VideoProviderContainer
                {...{
                  swapLayout,
                  cameraDock,
                  focusedId,
                  handleVideoFocus,
                }}
              />
            </Styled.Draggable>
          </Resizable>
        </Draggable>
      </Styled.ResizableWrapper>
    </>
  );
};

const WebcamContainer: React.FC = () => {
  const fullscreen = layoutSelect((i: Layout) => i.fullscreen);
  const isRTL = layoutSelect((i: Layout) => i.isRTL);
  const cameraDockInput = layoutSelectInput((i: Input) => i.cameraDock);
  const presentationInput = layoutSelectInput((i: Input) => i.presentation);
  const presentation = layoutSelectOutput((i: Output) => i.presentation);
  const cameraDock = layoutSelectOutput((i: Output) => i.cameraDock);
  const layoutContextDispatch = layoutDispatch();
  const { data: presentationPageData } = useDeduplicatedSubscription(CURRENT_PRESENTATION_PAGE_SUBSCRIPTION);
  const presentationPage = presentationPageData?.pres_page_curr[0] || {};
  const hasPresentation = !!presentationPage?.presentationId;
  const { isOpen: presentationIsOpen } = presentationInput;
  const isLayoutSwapped = !presentationIsOpen;

  const swapLayout = !hasPresentation || isLayoutSwapped;

  let floatingOverlay = false;
  let hideOverlay = false;

  if (swapLayout) {
    floatingOverlay = true;
    hideOverlay = true;
  }

  const { cameraOptimalGridSize } = cameraDockInput;
  const { display: displayPresentation } = presentation;

  const { data: currentUserData } = useCurrentUser((user) => ({
    presenter: user.presenter,
  }));
  const { selectedLayout } = useSettings(SETTINGS.APPLICATION) as { selectedLayout: string };

  const isGridEnabled = selectedLayout === LAYOUT_TYPE.VIDEO_FOCUS;

  const { streams: videoUsers, gridUsers } = useVideoStreams();

  let usersVideo: VideoItem[];
  if (gridUsers.length > 0) {
    usersVideo = [
      ...videoUsers,
      ...gridUsers,
    ];
  } else {
    usersVideo = videoUsers;
  }

  const audioModalIsOpen = useStorageKey('audioModalIsOpen');

  return !audioModalIsOpen && (usersVideo.length > 0 || isGridEnabled)
    ? (
      <WebcamComponent
        {...{
          swapLayout,
          usersVideo,
          focusedId: cameraDock.focusedId,
          cameraDock,
          cameraOptimalGridSize,
          layoutContextDispatch,
          fullscreen,
          isPresenter: currentUserData?.presenter ?? false,
          displayPresentation,
          isRTL,
          floatingOverlay,
          hideOverlay,
        }}
      />
    )
    : null;
};

export default WebcamContainer;
