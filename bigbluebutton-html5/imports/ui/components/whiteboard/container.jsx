import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { useMutation, useReactiveVar } from '@apollo/client';
import {
  AssetRecordType,
} from '@bigbluebutton/tldraw';
import { throttle } from 'radash';
import {
  CURRENT_PRESENTATION_PAGE_SUBSCRIPTION,
  CURRENT_PAGE_WRITERS_SUBSCRIPTION,
} from './queries';
import {
  initDefaultPages,
  persistShape,
  notifyNotAllowedChange,
  notifyShapeNumberExceeded,
  toggleToolsAnimations,
} from './service';
import {
  usePrevious,
} from './utils';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import Auth from '/imports/ui/services/auth';
import {
  layoutSelect,
  layoutDispatch,
} from '/imports/ui/components/layout/context';
import logger from '/imports/startup/client/logger';
import FullscreenService from '/imports/ui/components/common/fullscreen-button/service';
import deviceInfo from '/imports/utils/deviceInfo';
import Whiteboard from './component';
import ErrorBoundaryWithReload from '../common/error-boundary/error-boundary-with-reload/component';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import {
  PRESENTATION_SET_ZOOM,
  PRES_ANNOTATION_DELETE,
  PRES_ANNOTATION_SUBMIT,
  PRESENTATION_SET_PAGE,
  PRESENTATION_PUBLISH_CURSOR,
} from '../presentation/mutations';
import { useMergedCursorData } from './hooks.ts';
import useDeduplicatedSubscription from '../../core/hooks/useDeduplicatedSubscription';
import MediaService from '/imports/ui/components/media/service';
import { debounce } from '/imports/utils/debounce';
import useLockContext from '/imports/ui/components/lock-viewers/hooks/useLockContext';
import connectionStatus from '/imports/ui/core/graphql/singletons/connectionStatus';

const RECONNECT_SYNC_DELAY_MS = 750;
const VISIBILITY_REFETCH_DELAY_MS = 500;

const WhiteboardContainer = (props) => {
  const {
    zoomChanger,
    fitToWidth,
    initialPageAnnotations,
    refetchInitialPageAnnotations,
    annotationStreamData = [],
    restoreOnUpdate,
  } = props;

  const WHITEBOARD_CONFIG = window.meetingClientSettings.public.whiteboard;
  const layoutContextDispatch = layoutDispatch();

  const [editor, setEditor] = useState(null);
  const [shapes, setShapes] = useState([]);
  const [removedShapes, setRemovedShapes] = useState([]);
  const [isTabVisible, setIsTabVisible] = useState(document.visibilityState === 'visible');

  const { userLocks } = useLockContext();

  // Buffer queues for shapes and removals
  const shapesQueueRef = useRef([]);
  const removedQueueRef = useRef([]);
  const flushScheduledRef = useRef(false);

  const fetchDeletableShapesRef = useRef();
  const currentPresentationPageRef = useRef();

  // Aggregates the queues and updates state at once.
  const flushUpdates = useCallback(() => {
    const bufferedShapes = shapesQueueRef.current.flat();
    const bufferedRemovals = new Set(removedQueueRef.current.flat());
    shapesQueueRef.current = [];
    removedQueueRef.current = [];
    flushScheduledRef.current = false;

    setShapes((prevShapes) => {
      const lookup = new Map();
      prevShapes.forEach((shape) => {
        if (!bufferedRemovals.has(shape.id)) {
          lookup.set(shape.id, shape);
        }
      });

      bufferedShapes.forEach((shape) => {
        if (!bufferedRemovals.has(shape.id)) {
          lookup.set(shape.id, shape);
        }
      });
      return Array.from(lookup.values());
    });

    setRemovedShapes(Array.from(bufferedRemovals));
  }, [setShapes, setRemovedShapes]);

  // Schedule a flush only once per animation frame.
  const scheduleFlush = useCallback(() => {
    if (!flushScheduledRef.current) {
      flushScheduledRef.current = true;
      requestAnimationFrame(() => {
        flushUpdates();
      });
    }
  }, [flushUpdates]);

  const { data: currentUser } = useCurrentUser((user) => ({
    presenter: user.presenter,
    isModerator: user.isModerator,
    userId: user.userId,
    whiteboardWriteAccess: user.whiteboardWriteAccess,
  }));
  const isPresenter = currentUser?.presenter;
  const isModerator = currentUser?.isModerator;
  const hasWBAccess = currentUser?.whiteboardWriteAccess;

  const presenterChanged = usePrevious(isPresenter) !== isPresenter;

  const { data: presentationPageData } = useDeduplicatedSubscription(
    CURRENT_PRESENTATION_PAGE_SUBSCRIPTION,
  );
  const { pres_page_curr: presentationPageArray } = (presentationPageData || {});
  const currentPresentationPage = presentationPageArray && presentationPageArray[0];
  currentPresentationPageRef.current = currentPresentationPage;

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const curPageNum = currentPresentationPage?.num;
  const curPageId = currentPresentationPage?.pageId;
  const isInfiniteWhiteboard = currentPresentationPage?.infiniteWhiteboard;
  const curPageIdRef = useRef();
  curPageIdRef.current = curPageId;

  const presentationId = currentPresentationPage?.presentationId;

  const { data: whiteboardWritersData } = useDeduplicatedSubscription(
    CURRENT_PAGE_WRITERS_SUBSCRIPTION,
    {
      skip: !curPageId,
    },
  );

  const whiteboardWriters = whiteboardWritersData?.user_whiteboardWriteAccess || [];
  const wBAccessChanged = usePrevious(hasWBAccess) !== hasWBAccess;

  const [presentationSetZoom] = useMutation(PRESENTATION_SET_ZOOM);
  const [presentationSetPage] = useMutation(PRESENTATION_SET_PAGE);
  const [presentationDeleteAnnotations] = useMutation(PRES_ANNOTATION_DELETE);
  const [presentationSubmitAnnotations] = useMutation(PRES_ANNOTATION_SUBMIT);
  const [presentationPublishCursor] = useMutation(PRESENTATION_PUBLISH_CURSOR);

  const setPresentationPage = (pageId) => {
    presentationSetPage({
      variables: {
        presentationId,
        pageId,
      },
    });
  };

  const skipToSlide = (slideNum) => {
    const slideId = `${presentationId}/${slideNum}`;
    setPresentationPage(slideId);
  };

  const fetchDeletableShapes = useCallback((shapeIds) => {
    if (!hasWBAccess) return null;

    const currentShapeIds = new Set(shapes.map((s) => s.id));
    const myOwnShapeIds = new Set(
      shapes.filter((s) => s.meta?.createdBy === currentUser?.userId).map((s) => s.id),
    );
    const filteredShapeIds = shapeIds.filter((id) => currentShapeIds.has(id));
    const allowedShapeIds = (isModerator || isPresenter)
      ? filteredShapeIds
      : filteredShapeIds.filter((id) => myOwnShapeIds.has(id));

    return allowedShapeIds;
  }, [isModerator, isPresenter, hasWBAccess, shapes, currentUser?.userId]);

  fetchDeletableShapesRef.current = fetchDeletableShapes;

  const removeShapes = (shapeIds) => {
    const deletableShapeIds = fetchDeletableShapesRef.current?.(shapeIds);

    if (
      !Array.isArray(deletableShapeIds)
      || deletableShapeIds.length === 0
      || !curPageIdRef.current
    ) return;

    presentationDeleteAnnotations({
      variables: {
        pageId: curPageIdRef.current,
        annotationsIds: deletableShapeIds,
      },
    });
  };

  const zoomSlide = debounce((
    widthRatio, heightRatio, xOffset, yOffset, currPage = currentPresentationPage,
  ) => {
    const { pageId, num } = currPage;

    presentationSetZoom({
      variables: {
        presentationId,
        pageId,
        pageNum: num,
        xOffset,
        yOffset,
        widthRatio,
        heightRatio,
      },
    });
  }, 500);

  const submitAnnotations = async (newAnnotations) => {
    if (!curPageIdRef.current) return false;
    const isAnnotationSent = await presentationSubmitAnnotations({
      variables: {
        pageId: curPageIdRef.current,
        annotations: newAnnotations,
      },
    });

    return isAnnotationSent?.data?.presAnnotationSubmit;
  };

  const persistShapeWrapper = (shape, whiteboardId, amIModerator) => {
    persistShape(shape, whiteboardId, amIModerator, submitAnnotations);
  };

  const publishCursorUpdate = useCallback((payload) => {
    const { whiteboardId, xPercent, yPercent } = payload;

    if (!whiteboardId || !xPercent || !yPercent || !(hasWBAccess || isPresenter)) return;

    presentationPublishCursor({
      variables: {
        whiteboardId,
        xPercent,
        yPercent,
      },
    });
  }, [hasWBAccess, isPresenter]);

  const throttledPublishCursorUpdate = useMemo(() => throttle(
    { interval: WHITEBOARD_CONFIG.cursorInterval },
    publishCursorUpdate,
  ), [publishCursorUpdate]);

  const isMultiUserActive = whiteboardWriters.filter((u) => !u.presenter)?.length > 0;
  const cursorArray = useMergedCursorData();

  const connectedStatus = useReactiveVar(connectionStatus.getConnectedStatusVar());

  useEffect(() => {
    setTimeout(async () => {
      if (!currentPresentationPageRef.current?.pageId || !editor || !connectedStatus) return;
      try {
        const result = await refetchInitialPageAnnotations();
        const serverAnnotations = result?.data?.pres_annotation_curr || [];
        const serverMap = new Map();
        serverAnnotations.forEach((ann) => {
          const meta = ann.annotationInfo?.meta || {};
          serverMap.set(ann.annotationId, { ...ann, meta });
        });

        const localShapes = editor.getCurrentPageShapes();
        const shapesToRemove = [];
        const shapesToResync = [];

        localShapes.forEach((shape) => {
          if (shape.id.startsWith('shape:BG-')) return;
          const serverAnn = serverMap.get(shape.id);
          if (!serverAnn) {
            if (isMultiUserActive && hasWBAccess) {
              shapesToResync.push(shape);
            } else {
              shapesToRemove.push(shape.id);
            }
          } else {
            const localMeta = shape.meta || {};
            const serverMeta = serverAnn.meta || {};
            if (
              serverMeta.synced === true
              && serverMeta.version
              && localMeta.version !== serverMeta.version
            ) {
              shapesToRemove.push(shape.id);
            }
          }
        });

        if (shapesToResync.length > 0) {
          const newAnnotations = shapesToResync.map((shape) => ({
            annotationId: shape.id,
            annotationInfo: JSON.stringify(shape),
          }));
          try {
            await submitAnnotations(newAnnotations);
          } catch (err) {
            logger.error(
              { logCode: 'wbShapeSyncSubmit' },
              `Error sending shapes: ${err}`,
            );
          }
        }

        if (shapesToRemove.length > 0) {
          removedQueueRef.current.push(shapesToRemove);
          scheduleFlush();
        }
      } catch (error) {
        logger.error(
          { logCode: 'wbShapeSync' },
          `Error during reconnection sync: ${error}`,
        );
      }
    }, RECONNECT_SYNC_DELAY_MS);
  }, [
    connectedStatus,
    isMultiUserActive,
    hasWBAccess,
    presenterChanged,
    wBAccessChanged,
  ]);

  useEffect(() => {
    const processedAnnotationIds = new Set();
    const validShapes = [];
    const annotationsToBeRemoved = new Set();

    for (let i = annotationStreamData.length - 1; i >= 0; i -= 1) {
      const annotation = annotationStreamData[i];
      const { annotationId, annotationInfo } = annotation;

      // Only process if we haven't seen this annotationId yet.
      if (!processedAnnotationIds.has(annotationId)) {
        processedAnnotationIds.add(annotationId);
        if (!annotationInfo) {
          annotationsToBeRemoved.add(annotationId);
        } else {
          validShapes.push({
            ...annotationInfo,
            id: annotationId,
            meta: { ...annotationInfo.meta },
          });
        }
      }
    }

    // If there are valid shape updates, push them into the queue.
    if (validShapes.length > 0) {
      shapesQueueRef.current.push(validShapes);
    }
    // If there are removals, push them into the removal queue.
    if (annotationsToBeRemoved.size > 0) {
      removedQueueRef.current.push([...annotationsToBeRemoved]);
    }

    // Schedule a flush on the next animation frame. This ensures that all rapid
    // subscription updates are batched together into a single state update,
    // synchronizing updates with the browser's rendering cycle.
    scheduleFlush();
  }, [annotationStreamData]);

  useEffect(() => {
    if (!isTabVisible || !curPageIdRef.current || !connectedStatus) return;

    setTimeout(() => {
      refetchInitialPageAnnotations();
    }, VISIBILITY_REFETCH_DELAY_MS);
  }, [isTabVisible, connectedStatus, fitToWidth]);

  const processAnnotations = (data) => {
    let annotationsToBeRemoved = [];
    const newAnnotations = [];
    const updatedAnnotations = [];

    data.forEach((item) => {
      if (!item.annotationInfo) {
        annotationsToBeRemoved.push(item.annotationId);
      } else {
        const annotationInfoParsed = JSON.parse(item.annotationInfo);
        const existingShape = editor?.getCurrentPageShapes().find(
          (s) => s.id === item.annotationId,
        );
        if (existingShape) {
          updatedAnnotations.push({
            ...item,
            annotationInfo: annotationInfoParsed,
          });

          annotationsToBeRemoved = annotationsToBeRemoved.filter(
            (id) => id !== item.annotationId,
          );
        } else {
          newAnnotations.push({
            ...item,
            annotationInfo: annotationInfoParsed,
          });
        }
      }
    });

    setShapes(() => [
      ...updatedAnnotations.map(({ annotationInfo, annotationId }) => ({
        ...annotationInfo,
        id: annotationId,
      })),
      ...newAnnotations.map(({ annotationInfo, annotationId }) => ({
        ...annotationInfo,
        id: annotationId,
      })),
    ]);

    if (updatedAnnotations.length > 0 || newAnnotations.length > 0) {
      if (restoreOnUpdate) {
        MediaService.setPresentationIsOpen(layoutContextDispatch, true);
      }
    }

    setRemovedShapes(annotationsToBeRemoved.length > 0 ? annotationsToBeRemoved : []);
  };

  useEffect(() => {
    if (initialPageAnnotations && initialPageAnnotations.pres_annotation_curr) {
      processAnnotations(initialPageAnnotations.pres_annotation_curr);
    }
  }, [initialPageAnnotations]);

  const bgShape = [];

  const { isIphone, isPhone } = deviceInfo;

  const assetId = AssetRecordType.createId(curPageNum);
  const assets = [{
    id: assetId,
    typeName: 'asset',
    type: 'image',
    meta: {},
    props: {
      w: currentPresentationPage?.scaledWidth,
      h: currentPresentationPage?.scaledHeight,
      src: currentPresentationPage?.svgUrl,
      name: '',
      isAnimated: false,
      mimeType: null,
    },
  }];

  const Settings = getSettingsSingletonInstance();
  const { isRTL } = Settings.application;
  const width = layoutSelect((i) => i?.output?.presentation?.width);
  const height = layoutSelect((i) => i?.output?.presentation?.height);
  const layoutType = layoutSelect((i) => i?.layoutType);
  const layoutChanged = usePrevious(layoutType) !== layoutType;

  const sidebarNavigationWidth = layoutSelect(
    (i) => i?.output?.sidebarNavigation?.width,
  );
  const { maxStickyNoteLength, maxNumberOfAnnotations, lockToolbarTools } = WHITEBOARD_CONFIG;
  const fontFamily = WHITEBOARD_CONFIG.styles.text.family;
  const {
    colorStyle, dashStyle, fillStyle, fontStyle, sizeStyle,
  } = WHITEBOARD_CONFIG.styles;
  const handleToggleFullScreen = (ref) => FullscreenService.toggleFullScreen(ref);

  // use -0.5 offset to avoid white borders rounding erros
  bgShape.push({
    x: -0.5,
    y: -0.5,
    rotation: 0,
    isLocked: true,
    opacity: 1,
    meta: {},
    id: `shape:BG-${curPageNum}`,
    type: 'image',
    props: {
      w: currentPresentationPage?.scaledWidth + 1.5 || 1,
      h: currentPresentationPage?.scaledHeight + 1.5 || 1,
      assetId,
      playing: true,
      url: '',
      crop: null,
    },
    parentId: `page:${curPageNum}`,
    index: 'a0',
    typeName: 'shape',
  });

  if (!currentPresentationPage) return null;

  return (
    <ErrorBoundaryWithReload>
      <Whiteboard
        key={presentationId}
        {...{
          isPresenter,
          isModerator,
          currentUser,
          isRTL,
          width,
          height,
          maxStickyNoteLength,
          maxNumberOfAnnotations,
          lockToolbarTools,
          fontFamily,
          colorStyle,
          dashStyle,
          fillStyle,
          fontStyle,
          sizeStyle,
          handleToggleFullScreen,
          sidebarNavigationWidth,
          layoutContextDispatch,
          initDefaultPages,
          persistShapeWrapper,
          isMultiUserActive,
          shapes,
          removedShapes,
          bgShape,
          assets,
          removeShapes,
          zoomSlide,
          notifyNotAllowedChange,
          notifyShapeNumberExceeded,
          whiteboardToolbarAutoHide: Settings?.application?.whiteboardToolbarAutoHide,
          animations: Settings?.application?.animations,
          toggleToolsAnimations,
          isIphone,
          isPhone,
          currentPresentationPage,
          numberOfPages: currentPresentationPage?.totalPages,
          presentationId,
          hasWBAccess,
          whiteboardWriters,
          zoomChanger,
          skipToSlide,
          locale: Settings?.application?.locale,
          darkTheme: Settings?.application?.darkTheme,
          selectedLayout: Settings?.application?.selectedLayout,
          isInfiniteWhiteboard,
          curPageNum,
          setEditor,
          layoutChanged,
        }}
        {...props}
        meetingId={Auth.meetingID}
        publishCursorUpdate={throttledPublishCursorUpdate}
        otherCursors={cursorArray}
        hideViewersCursor={userLocks?.hideViewersCursor}
      />
    </ErrorBoundaryWithReload>
  );
};

WhiteboardContainer.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  zoomChanger: PropTypes.func.isRequired,
  fitToWidth: PropTypes.bool.isRequired,
};

export default WhiteboardContainer;
