import React, {
  useState, useEffect, useRef, useCallback,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Draggable, { DraggableEvent } from 'react-draggable';
import { useIsGridEnabled, useVideoStreams } from '/imports/ui/components/video-provider/hooks';
import {
  layoutSelect,
  layoutSelectInput,
  layoutDispatch,
} from '/imports/ui/components/layout/context';
import { LAYOUT_TYPE, ACTIONS, CAMERADOCK_POSITION } from '/imports/ui/components/layout/enums';
import ResizeHandle, { ResizeEdge } from '/imports/ui/components/layout/shell/ResizeHandle';
import { useShellState } from '/imports/ui/components/layout/shell/context';
import {
  cameraDockPosition,
  cameraDockState,
  Edges,
  isCameraDockDraggable,
  isCameraDockShown,
  resizableCameraDockEdges,
} from '/imports/ui/components/layout/shell/selectors';
import {
  CURRENT_PRESENTATION_PAGE_SUBSCRIPTION,
  CurrentPresentationPageSubscriptionResponse,
} from '/imports/ui/components/whiteboard/queries';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import DropAreaContainer from './drop-areas/container';
import VideoProviderContainer from '/imports/ui/components/video-provider/container';
import VideoService from '/imports/ui/components/video-provider/service';
import Storage from '/imports/ui/services/storage/session';
import Styled from './styles';
import { Input, Layout } from '/imports/ui/components/layout/layoutTypes';
import { VideoItem } from '/imports/ui/components/video-provider/types';
import { VIDEO_TYPES } from '/imports/ui/components/video-provider/enums';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { useStorageKey } from '/imports/ui/services/storage/hooks';
import useSettings from '../../services/settings/hooks/useSettings';
import { SETTINGS } from '../../services/settings/enums';
import { INITIAL_INPUT_STATE } from '../layout/initState';
import { contentSidebarMarginToMedia } from '../../stylesheets/styled-components/general';
import { useMeasureRegion } from '../layout/measuredRegions';

const intlMessages = defineMessages({
  camerasAriaLabel: {
    id: 'app.video.cameraAriaLabel',
    description: 'Aria Label for cameras component',
  },
});

const CAMERA_DOCK_GRID_SNAP_TOLERANCE = 12;
const CAMERA_DOCK_GRID_SETTLE_DELAY = 100;

export const snapCameraDockDimensionToGrid = (
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
  /** where the dock is drawn (the engine's cameraDock.position) */
  position: string;
  isDraggable: boolean;
  resizableEdge: Edges;
  swapLayout: boolean;
  focusedId: string;
  layoutContextDispatch: (...args: unknown[]) => void;
  fullscreen: Layout['fullscreen'];
  isPresenter: boolean;
  presentationIsOpen: boolean;
  cameraOptimalGridSize: Input['cameraDock']['cameraOptimalGridSize'];
  snapToCameraGrid: boolean;
  isRTL: boolean;
  /** the dock sits in its position, rather than filling the media area or the window */
  isPositioned: boolean;
}

const RESIZE_EDGES: ResizeEdge[] = ['top', 'right', 'bottom', 'left'];

const WebcamComponent: React.FC<WebcamComponentProps> = ({
  position,
  isDraggable,
  resizableEdge,
  swapLayout,
  focusedId,
  layoutContextDispatch,
  fullscreen,
  isPresenter,
  presentationIsOpen,
  cameraOptimalGridSize: cameraSize,
  snapToCameraGrid,
  isRTL,
  isPositioned,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [draggedAtLeastOneTime, setDraggedAtLeastOneTime] = useState(false);
  // the dock's rendered box, for the push-layout rate; held while dragging, when it shrinks to a tile
  const measureCameraDock = useMeasureRegion<HTMLDivElement>('cameraDock', { hold: isDragging });
  const dockRef = useRef<HTMLDivElement | null>(null);
  const limitRef = useRef<HTMLDivElement | null>(null);
  const resizeStart = useRef({ width: 0, height: 0 });
  const cameraSizeRef = useRef(cameraSize);
  const cameraDockGridSettleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intl = useIntl();

  cameraSizeRef.current = cameraSize;

  const lastSize = Storage.getItem('webcamSize') || { width: 0, height: 0 };
  const { height: lastHeight } = lastSize as { width: number, height: number };

  const isCameraTopOrBottom = position === CAMERADOCK_POSITION.CONTENT_TOP
    || position === CAMERADOCK_POSITION.CONTENT_BOTTOM;
  const isCameraLeftOrRight = position === CAMERADOCK_POSITION.CONTENT_LEFT
    || position === CAMERADOCK_POSITION.CONTENT_RIGHT;
  const isCameraSidebar = position === CAMERADOCK_POSITION.SIDEBAR_CONTENT_BOTTOM;

  const attachDock = useCallback((element: HTMLDivElement | null) => {
    dockRef.current = element;
    measureCameraDock(element);
  }, [measureCameraDock]);

  /** the dock's size as drawn: the size the layout gave it */
  const dockSize = () => {
    const rect = dockRef.current?.getBoundingClientRect();
    return { width: rect?.width ?? 0, height: rect?.height ?? 0 };
  };

  const setDockSize = (width: number, height: number) => {
    layoutContextDispatch({
      type: ACTIONS.SET_CAMERA_DOCK_SIZE,
      value: {
        width,
        height,
      },
    });
  };

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
    const cams = document.getElementById('cameraDock');
    cams?.setAttribute('data-position', position);
  }, [position, isPresenter, presentationIsOpen]);

  // A side dock wider than it may be (80% of the media area, for the presenter the area less the
  // presentation toolbar) is held to that width, and the stored size with it, as the user's size.
  // Only while it sits beside the media: a dock that fills the media area (presentation minimized) or
  // the window has no such limit, as with the layout engine.
  useEffect(() => {
    if (!isCameraLeftOrRight || !isPositioned || isResizing || isDragging) return undefined;
    const holdWithinLimit = () => {
      const limit = limitRef.current?.getBoundingClientRect().width ?? 0;
      const { width, height } = dockSize();
      if (limit > 0 && width > limit + 0.5) {
        setDockSize(limit, height);
        Storage.setItem('webcamSize', { width: limit, height: lastHeight });
      }
    };
    holdWithinLimit();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(holdWithinLimit);
    if (limitRef.current) observer.observe(limitRef.current);
    if (dockRef.current) observer.observe(dockRef.current);
    return () => observer.disconnect();
  }, [position, isPresenter, presentationIsOpen, isResizing, isDragging, isPositioned]);

  const handleVideoFocus = useCallback((id: string) => {
    layoutContextDispatch({
      type: ACTIONS.SET_FOCUSED_CAMERA_ID,
      value: focusedId !== id ? id : INITIAL_INPUT_STATE.cameraDock.focusedId,
    });
  }, [focusedId, layoutContextDispatch]);

  const isVerticalResize = (edge: ResizeEdge) => edge === 'top' || edge === 'bottom';

  const onResizeStart = () => {
    if (cameraDockGridSettleTimeoutRef.current !== null) {
      clearTimeout(cameraDockGridSettleTimeoutRef.current);
      cameraDockGridSettleTimeoutRef.current = null;
    }
    setIsResizing(true);
    const start = dockSize();
    resizeStart.current = start;
    setDockSize(start.width, start.height);
    layoutContextDispatch({
      type: ACTIONS.SET_CAMERA_DOCK_IS_RESIZING,
      value: true,
    });
  };

  // the live size goes to the layout as dragged; the CSS holds it within the dock's limits
  const onResize = (edge: ResizeEdge, delta: number) => {
    const start = resizeStart.current;
    if (isVerticalResize(edge)) setDockSize(start.width, start.height + delta);
    else setDockSize(start.width + delta, start.height);
  };

  const snapCameraDockToGrid = () => {
    if (!snapToCameraGrid) return;
    const currentCameraSize = cameraSizeRef.current;
    const { width, height: dockHeight } = dockSize();
    const height = snapCameraDockDimensionToGrid(dockHeight, currentCameraSize?.height, 120, dockHeight);
    if (height === dockHeight) return;
    setDockSize(width, height);
  };

  const onResizeEnd = () => {
    // the size the dock settled at, within its limits, is the user's size (a dock no longer drawn, its
    // cameras gone mid-resize, keeps the size it was dragged to)
    const settled = dockSize();
    if (settled.width > 0 && settled.height > 0) setDockSize(settled.width, settled.height);
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

  const isIphone = !!(navigator.userAgent.match(/iPhone/i));
  let padding = '';
  if (isCameraSidebar && isRTL) padding = `0px 0px 0px ${contentSidebarMarginToMedia}`;
  if (isCameraSidebar && !isRTL) padding = `0px ${contentSidebarMarginToMedia} 0px 0px`;
  const canResize = !isFullScreen && !isDragging && !swapLayout;

  return (
    <>
      {isDragging ? <DropAreaContainer /> : null}
      <Styled.ResizableWrapper
        $horizontal={isCameraTopOrBottom}
        $vertical={isCameraLeftOrRight}
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
            isDraggable ? (e) => e.preventDefault() : undefined
          }
          disabled={!isDraggable || isResizing || isFullScreen}
          // the CSS layout places the dock; the drag only moves it while it lasts
          position={{ x: 0, y: 0 }}
        >
          <div
            data-layout-region="camera-dock"
            style={{ padding }}
          >
            <Styled.Draggable
              ref={attachDock}
              $isDraggable={isDraggable && !isFullScreen && !isDragging}
              $isDragging={isDragging}
              id="cameraDock"
              role="region"
              draggable={isDraggable && !isFullScreen ? 'true' : undefined}
              style={{
                // the iPhone got the dock's size in px, the sidebar's width included
                width: isIphone && isCameraSidebar ? 'calc(100% + 1vw)' : undefined,
                opacity: isDragging ? 0.5 : undefined,
                background: 'none',
              }}
            >
              <>
                <h2 className="sr-only">{intl.formatMessage(intlMessages.camerasAriaLabel)}</h2>
                <VideoProviderContainer
                  {...{
                    swapLayout,
                    cameraDock: { position },
                    focusedId,
                    handleVideoFocus,
                  }}
                />
              </>
            </Styled.Draggable>
            {RESIZE_EDGES.map((edge) => (
              <ResizeHandle
                key={edge}
                edge={edge}
                dataTest={`cameraDockResizeHandle-${edge}`}
                disabled={!(canResize && resizableEdge[edge])}
                onResizeStart={onResizeStart}
                onResize={(delta) => onResize(edge, delta)}
                onResizeEnd={onResizeEnd}
              />
            ))}
          </div>
        </Draggable>
        <div data-layout-region="camera-dock-limit" ref={limitRef} />
      </Styled.ResizableWrapper>
    </>
  );
};

const WebcamContainer: React.FC = () => {
  const fullscreen = layoutSelect((i: Layout) => i.fullscreen);
  const isRTL = layoutSelect((i: Layout) => i.isRTL);
  const cameraDockInput = layoutSelectInput((i: Input) => i.cameraDock);
  const presentationInput = layoutSelectInput((i: Input) => i.presentation);
  const shell = useShellState();
  const layoutContextDispatch = layoutDispatch();
  const { data: presentationPageData } = useDeduplicatedSubscription<
    CurrentPresentationPageSubscriptionResponse>(CURRENT_PRESENTATION_PAGE_SUBSCRIPTION);
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

  const { cameraOptimalGridSize, focusedId } = cameraDockInput;

  const { data: currentUserData } = useCurrentUser((user) => ({
    presenter: user.presenter,
  }));
  const { selectedLayout } = useSettings(SETTINGS.LAYOUT) as { selectedLayout: string };
  const isUnifiedLayout = selectedLayout === LAYOUT_TYPE.UNIFIED_LAYOUT;
  const snapToCameraGrid = isUnifiedLayout;

  const isGridEnabled = useIsGridEnabled();

  const { streams: videoUsers, gridUsers } = useVideoStreams();
  VideoService.updateActivePeers(videoUsers);

  // Count only real camera streams. AUDIO_ONLY (speaking) tiles are merged into the
  // stream set for the unified layout, but they must not inflate the camera count:
  // otherwise speaking with no webcams shared forces the top camera dock to display and
  // shrinks the presentation, even while the presentation is visible (issue #25235).
  const numCamerasValue = videoUsers.filter((vs) => vs.type !== VIDEO_TYPES.AUDIO_ONLY).length;

  useEffect(() => {
    layoutContextDispatch({
      type: ACTIONS.SET_NUM_CAMERAS,
      value: numCamerasValue,
    });
  }, [numCamerasValue]);

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

  if (!shell) return null;
  const position = cameraDockPosition(shell) ?? '';

  return isCameraDockShown(shell) && !audioModalIsOpen && (usersVideo.length > 0 || isGridEnabled)
    ? (
      <WebcamComponent
        {...{
          position,
          isDraggable: isCameraDockDraggable(shell),
          resizableEdge: resizableCameraDockEdges(shell),
          isPositioned: cameraDockState(shell) === 'positioned',
          swapLayout,
          usersVideo,
          focusedId,
          cameraOptimalGridSize,
          snapToCameraGrid,
          layoutContextDispatch,
          fullscreen,
          isPresenter: currentUserData?.presenter ?? false,
          presentationIsOpen,
          isRTL,
          floatingOverlay,
          hideOverlay,
        }}
      />
    )
    : null;
};

export default WebcamContainer;
