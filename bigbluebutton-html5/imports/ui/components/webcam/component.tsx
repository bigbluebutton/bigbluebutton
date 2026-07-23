import React, { useState, useEffect, useRef } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Resizable } from 're-resizable';
import Draggable, { DraggableEvent } from 'react-draggable';
import { useVideoStreams } from '/imports/ui/components/video-provider/hooks';
import {
  layoutSelect,
  layoutSelectInput,
  layoutSelectOutput,
  layoutDispatch,
} from '/imports/ui/components/layout/context';
import { LAYOUT_TYPE, ACTIONS, CAMERADOCK_POSITION } from '/imports/ui/components/layout/enums';
import { CURRENT_PRESENTATION_PAGE_SUBSCRIPTION, CurrentPresentationPagesSubscriptionResponse } from '/imports/ui/components/whiteboard/queries';
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
import { INITIAL_INPUT_STATE } from '../layout/initState';

const intlMessages = defineMessages({
  camerasAriaLabel: {
    id: 'app.video.cameraAriaLabel',
    description: 'Aria Label for cameras component',
  },
});

const CAMERA_DOCK_GRID_SNAP_TOLERANCE = 12;
const CAMERA_DOCK_GRID_SETTLE_DELAY = 100;

const snapCameraDockDimensionToGrid = (
  dockSize: number,
  gridSize: number | undefined,
  minSize: number,
  maxSize: number,
) => {
  if (!gridSize || dockSize - gridSize <= CAMERA_DOCK_GRID_SNAP_TOLERANCE) {
    return dockSize;
  }

  return Math.min(Math.max(gridSize, minSize), maxSize);
};

interface WebcamComponentProps {
  cameraDock: Output['cameraDock'];
  swapLayout: boolean;
  focusedId: string;
  layoutContextDispatch: (...args: unknown[]) => void;
  fullscreen: Layout['fullscreen'];
  isPresenter: boolean;
  displayPresentation: boolean;
  cameraOptimalGridSize: Input['cameraDock']['cameraOptimalGridSize'];
  snapToCameraGrid: boolean;
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
  snapToCameraGrid,
  isRTL,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0 });
  const [cameraMaxWidth, setCameraMaxWidth] = useState(0);
  const [draggedAtLeastOneTime, setDraggedAtLeastOneTime] = useState(false);
  const cameraDockRef = useRef(cameraDock);
  const cameraSizeRef = useRef(cameraSize);
  const cameraDockGridSettleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intl = useIntl();

  cameraDockRef.current = cameraDock;
  cameraSizeRef.current = cameraSize;

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

  useEffect(() => () => {
    if (cameraDockGridSettleTimeoutRef.current !== null) {
      clearTimeout(cameraDockGridSettleTimeoutRef.current);
    }
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
      value: focusedId !== id ? id : INITIAL_INPUT_STATE.cameraDock.focusedId,
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

  const snapCameraDockToGrid = () => {
    if (!snapToCameraGrid) return;

    const currentCameraDock = cameraDockRef.current;
    const currentCameraSize = cameraSizeRef.current;
    const isCurrentCameraTopOrBottom = currentCameraDock.position === CAMERADOCK_POSITION.CONTENT_TOP
      || currentCameraDock.position === CAMERADOCK_POSITION.CONTENT_BOTTOM;

    const height = isCurrentCameraTopOrBottom
      ? snapCameraDockDimensionToGrid(
        currentCameraDock.height,
        currentCameraSize?.height,
        currentCameraDock.minHeight,
        currentCameraDock.maxHeight,
      )
      : currentCameraDock.height;

    if (height === currentCameraDock.height) return;

    layoutContextDispatch({
      type: ACTIONS.SET_CAMERA_DOCK_SIZE,
      value: {
        width: currentCameraDock.width,
        height,
        browserWidth: window.innerWidth,
        browserHeight: window.innerHeight,
      },
    });
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
  const mobileWidth = `${isDragging ? cameraSize?.width : cameraDock.width}px`;
  const mobileHeight = `${isDragging ? cameraSize?.height : cameraDock.height}px`;
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
          disabled={!cameraDock.isDraggable || isResizing || isFullScreen}
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
              if (cameraDockGridSettleTimeoutRef.current !== null) {
                clearTimeout(cameraDockGridSettleTimeoutRef.current);
                cameraDockGridSettleTimeoutRef.current = null;
              }
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
              const stopCameraDockResize = () => {
                layoutContextDispatch({
                  type: ACTIONS.SET_CAMERA_DOCK_IS_RESIZING,
                  value: false,
                });
              };

              if (snapToCameraGrid && isCameraTopOrBottom) {
                // Let the throttled grid calculation observe the final pointer size before
                // compacting it. This keeps larger row/column transitions reachable.
                if (cameraDockGridSettleTimeoutRef.current !== null) {
                  clearTimeout(cameraDockGridSettleTimeoutRef.current);
                }
                cameraDockGridSettleTimeoutRef.current = setTimeout(() => {
                  cameraDockGridSettleTimeoutRef.current = null;
                  snapCameraDockToGrid();
                  stopCameraDockResize();
                }, CAMERA_DOCK_GRID_SETTLE_DELAY);
              } else {
                stopCameraDockResize();
              }
            }}
            enable={{
              top: !isFullScreen && !isDragging && !swapLayout && cameraDock?.resizableEdge?.top,
              bottom: !isFullScreen && !isDragging && !swapLayout
              && cameraDock?.resizableEdge?.bottom,
              left: !isFullScreen && !isDragging && !swapLayout && cameraDock?.resizableEdge?.left,
              right: !isFullScreen && !isDragging && !swapLayout && cameraDock?.resizableEdge?.right,
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
              $isDraggable={!!cameraDock.isDraggable && !isFullScreen && !isDragging}
              $isDragging={isDragging}
              id="cameraDock"
              role="region"
              draggable={cameraDock.isDraggable && !isFullScreen ? 'true' : undefined}
              style={{
                width: isIphone ? mobileWidth : isDesktopWidth,
                height: isIphone ? mobileHeight : isDesktopHeight,
                opacity: camOpacity,
                background: 'none',
              }}
            >
              <>
                <h2 className="sr-only">{intl.formatMessage(intlMessages.camerasAriaLabel)}</h2>
                <VideoProviderContainer
                  {...{
                    swapLayout,
                    cameraDock,
                    focusedId,
                    handleVideoFocus,
                  }}
                />
              </>
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
  const { data: presentationPageData } = useDeduplicatedSubscription<CurrentPresentationPagesSubscriptionResponse>(
    CURRENT_PRESENTATION_PAGE_SUBSCRIPTION,
  );
  const presentationPage = presentationPageData?.pres_page_curr[0];
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
  const isVideoFocus = selectedLayout === LAYOUT_TYPE.VIDEO_FOCUS;
  const isUnifiedLayout = selectedLayout === LAYOUT_TYPE.UNIFIED_LAYOUT;
  const snapToCameraGrid = selectedLayout === LAYOUT_TYPE.CUSTOM_LAYOUT
    || selectedLayout === LAYOUT_TYPE.UNIFIED_LAYOUT;

  const isGridEnabled = isVideoFocus || (isUnifiedLayout && !presentationIsOpen);

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

  return cameraDock?.display && !audioModalIsOpen && (usersVideo.length > 0 || isGridEnabled)
    ? (
      <WebcamComponent
        {...{
          swapLayout,
          usersVideo,
          focusedId: cameraDock.focusedId,
          cameraDock,
          cameraOptimalGridSize,
          snapToCameraGrid,
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
