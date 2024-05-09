import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
} from 'react';
import { useSubscription, useMutation } from '@apollo/client';
import {
  AssetRecordType,
} from '@tldraw/tldraw';
import { throttle } from 'radash';
import {
  CURRENT_PRESENTATION_PAGE_SUBSCRIPTION,
  CURRENT_PAGE_ANNOTATIONS_STREAM,
  CURRENT_PAGE_WRITERS_SUBSCRIPTION,
  CURSOR_SUBSCRIPTION,
} from './queries';
import {
  initDefaultPages,
  persistShape,
  notifyNotAllowedChange,
  notifyShapeNumberExceeded,
  toggleToolsAnimations,
  formatAnnotations,
} from './service';
import SettingsService from '/imports/ui/services/settings';
import Auth from '/imports/ui/services/auth';
import {
  layoutSelect,
  layoutDispatch,
} from '/imports/ui/components/layout/context';
import FullscreenService from '/imports/ui/components/common/fullscreen-button/service';
import deviceInfo from '/imports/utils/deviceInfo';
import Whiteboard from './component';

import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import {
  PRESENTATION_SET_ZOOM,
  PRES_ANNOTATION_DELETE,
  PRES_ANNOTATION_SUBMIT,
  PRESENTATION_SET_PAGE,
  PRESENTATION_PUBLISH_CURSOR,
} from '../presentation/mutations';
import { useMergedCursorData } from './hooks.ts';

const WHITEBOARD_CONFIG = window.meetingClientSettings.public.whiteboard;

const WhiteboardContainer = (props) => {
  const {
    intl,
    zoomChanger,
  } = props;

  const [annotations, setAnnotations] = useState([]);
  const [shapes, setShapes] = useState({});

  const meeting = useMeeting((m) => ({
    lockSettings: m?.lockSettings,
  }));

  const { data: presentationPageData } = useSubscription(CURRENT_PRESENTATION_PAGE_SUBSCRIPTION);
  const { pres_page_curr: presentationPageArray } = (presentationPageData || {});
  const currentPresentationPage = presentationPageArray && presentationPageArray[0];
  const curPageNum = currentPresentationPage?.num;
  const curPageId = currentPresentationPage?.pageId;
  const curPageIdRef = useRef();

  React.useEffect(() => {
    curPageIdRef.current = curPageId;
  }, [curPageId]);

  const presentationId = currentPresentationPage?.presentationId;

  const { data: whiteboardWritersData } = useSubscription(CURRENT_PAGE_WRITERS_SUBSCRIPTION, {
    variables: { pageId: curPageId },
    skip: !curPageId,
  });
  const whiteboardWriters = whiteboardWritersData?.pres_page_writers || [];
  const hasWBAccess = whiteboardWriters?.some((writer) => writer.userId === Auth.userID);

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

  const removeShapes = (shapeIds) => {
    presentationDeleteAnnotations({
      variables: {
        pageId: curPageIdRef.current,
        annotationsIds: shapeIds,
      },
    });
  };

  const zoomSlide = (widthRatio, heightRatio, xOffset, yOffset) => {
    const { pageId, num } = currentPresentationPage;

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
  };

  const submitAnnotations = async (newAnnotations) => {
    const isAnnotationSent = await presentationSubmitAnnotations({
      variables: {
        pageId: curPageIdRef.current,
        annotations: newAnnotations,
      },
    });

    return isAnnotationSent?.data?.presAnnotationSubmit;
  };

  const persistShapeWrapper = (shape, whiteboardId, isModerator) => {
    persistShape(shape, whiteboardId, isModerator, submitAnnotations);
  };

  const publishCursorUpdate = (payload) => {
    const { whiteboardId, xPercent, yPercent } = payload;

    if (!whiteboardId || !xPercent || !yPercent) return;

    presentationPublishCursor({
      variables: {
        whiteboardId,
        xPercent,
        yPercent,
      },
    });
  };

  const throttledPublishCursorUpdate = useMemo(() => throttle(
    { interval: WHITEBOARD_CONFIG.cursorInterval },
    publishCursorUpdate,
  ), []);

  const isMultiUserActive = whiteboardWriters?.length > 0;

  const { data: currentUser } = useCurrentUser((user) => ({
    presenter: user.presenter,
    isModerator: user.isModerator,
    userId: user.userId,
  }));

  const cursorArray = useMergedCursorData();

  const { data: annotationStreamData } = useSubscription(
    CURRENT_PAGE_ANNOTATIONS_STREAM,
    {
      variables: { lastUpdatedAt: new Date(0).toISOString() },
    },
  );

  useEffect(() => {
    const { pres_annotation_curr_stream: annotationStream } = annotationStreamData || {};

    if (annotationStream) {
      const newAnnotations = [];
      const annotationsToBeRemoved = [];
      annotationStream.forEach((item) => {
        if (item.annotationInfo === '') {
          annotationsToBeRemoved.push(item.annotationId);
        } else {
          newAnnotations.push(item);
        }
      });
      const currentAnnotations = annotations.filter(
        (annotation) => !annotationsToBeRemoved.includes(annotation.annotationId),
      );
      setAnnotations([...currentAnnotations, ...newAnnotations]);
    }
  }, [annotationStreamData]);

  const bgShape = [];

  React.useEffect(() => {
    const updatedShapes = formatAnnotations(
      annotations.filter((annotation) => annotation.pageId === curPageIdRef.current),
      intl,
      curPageNum,
      currentPresentationPage,
    );
    setShapes(updatedShapes);
  }, [annotations, intl, curPageNum, currentPresentationPage]);

  const { isIphone } = deviceInfo;

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

  const isRTL = layoutSelect((i) => i.isRTL);
  const width = layoutSelect((i) => i?.output?.presentation?.width);
  const height = layoutSelect((i) => i?.output?.presentation?.height);
  const sidebarNavigationWidth = layoutSelect(
    (i) => i?.output?.sidebarNavigation?.width,
  );
  const isPresenter = currentUser?.presenter;
  const isModerator = currentUser?.isModerator;
  const { maxStickyNoteLength, maxNumberOfAnnotations } = WHITEBOARD_CONFIG;
  const fontFamily = WHITEBOARD_CONFIG.styles.text.family;
  const {
    colorStyle, dashStyle, fillStyle, fontStyle, sizeStyle,
  } = WHITEBOARD_CONFIG.styles;
  const handleToggleFullScreen = (ref) => FullscreenService.toggleFullScreen(ref);
  const layoutContextDispatch = layoutDispatch();

  bgShape.push({
    x: 1,
    y: 1,
    rotation: 0,
    isLocked: true,
    opacity: 1,
    meta: {},
    id: `shape:BG-${curPageNum}`,
    type: 'image',
    props: {
      w: currentPresentationPage?.scaledWidth || 1,
      h: currentPresentationPage?.scaledHeight || 1,
      assetId,
      playing: true,
      url: '',
      crop: null,
    },
    parentId: `page:${curPageNum}`,
    index: 'a0',
    typeName: 'shape',
  });

  if (!currentPresentationPage) return;

  return (
    <Whiteboard
      {...{
        isPresenter,
        isModerator,
        currentUser,
        isRTL,
        width,
        height,
        maxStickyNoteLength,
        maxNumberOfAnnotations,
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
        bgShape,
        assets,
        removeShapes,
        zoomSlide,
        notifyNotAllowedChange,
        notifyShapeNumberExceeded,
        whiteboardToolbarAutoHide:
      SettingsService?.application?.whiteboardToolbarAutoHide,
        animations: SettingsService?.application?.animations,
        toggleToolsAnimations,
        isIphone,
        currentPresentationPage,
        numberOfPages: currentPresentationPage?.totalPages,
        presentationId,
        hasWBAccess,
        whiteboardWriters,
        zoomChanger,
        skipToSlide,
      }}
      {...props}
      meetingId={Auth.meetingID}
      publishCursorUpdate={throttledPublishCursorUpdate}
      otherCursors={cursorArray}
      hideViewersCursor={meeting?.data?.lockSettings?.hideViewersCursor}
    />
  );
};

export default WhiteboardContainer;
