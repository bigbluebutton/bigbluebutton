import React from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import {
  CURRENT_PRESENTATION_PAGE_SUBSCRIPTION,
  CURRENT_PAGE_ANNOTATIONS_QUERY,
  CURRENT_PAGE_ANNOTATIONS_STREAM,
  CURRENT_PAGE_WRITERS_SUBSCRIPTION,
} from './queries';
import { CURSOR_SUBSCRIPTION } from './cursors/queries';
import {
  initDefaultPages,
  persistShape,
  removeShapes,
  changeCurrentSlide,
  notifyNotAllowedChange,
  notifyShapeNumberExceeded,
  toggleToolsAnimations,
  formatAnnotations,
} from './service';
import CursorService from './cursors/service';
import PresentationToolbarService from '../presentation/presentation-toolbar/service';
import SettingsService from '/imports/ui/services/settings';
import Auth from '/imports/ui/services/auth';
import {
  layoutSelect,
  layoutDispatch,
} from '/imports/ui/components/layout/context';
import FullscreenService from '/imports/ui/components/common/fullscreen-button/service';
import deviceInfo from '/imports/utils/deviceInfo';
import Whiteboard from './component';
import POLL_RESULTS_SUBSCRIPTION from '/imports/ui/core/graphql/queries/pollResultsSubscription';

import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import {
  AssetRecordType,
} from "@tldraw/tldraw";

const WHITEBOARD_CONFIG = Meteor.settings.public.whiteboard;

let annotations = [];
let lastUpdatedAt = null;

const WhiteboardContainer = (props) => {
  const {
    intl,
    slidePosition,
    svgUri,
  } = props;

  const meeting = useMeeting((m) => ({
    lockSettings: m?.lockSettings,
  }));

  const { data: presentationPageData } = useSubscription(CURRENT_PRESENTATION_PAGE_SUBSCRIPTION);
  const { pres_page_curr: presentationPageArray } = (presentationPageData || {});
  const currentPresentationPage = presentationPageArray && presentationPageArray[0];
  const curPageId = currentPresentationPage?.num;
  const presentationId = currentPresentationPage?.presentationId;

  const { data: whiteboardWritersData } = useSubscription(CURRENT_PAGE_WRITERS_SUBSCRIPTION);
  const whiteboardWriters = whiteboardWritersData?.pres_page_writers || [];
  const hasWBAccess = whiteboardWriters?.some((writer) => writer.userId === Auth.userID);

  const isMultiUserActive = whiteboardWriters?.length > 0;

  const { data: pollData } = useSubscription(POLL_RESULTS_SUBSCRIPTION);
  const pollResults = pollData?.poll[0] || null;

  const { data: currentUser } = useCurrentUser((user) => ({
    presenter: user.presenter,
    isModerator: user.isModerator,
    userId: user.userId,
  }));

  const { data: cursorData } = useSubscription(CURSOR_SUBSCRIPTION);
  const { pres_page_cursor: cursorArray } = (cursorData || []);

  const {
    loading: annotationsLoading,
    data: annotationsData,
  } = useQuery(CURRENT_PAGE_ANNOTATIONS_QUERY);
  const { pres_annotation_curr: history } = (annotationsData || []);

  const lastHistoryTime = history?.[0]?.lastUpdatedAt || null;

  if (!lastUpdatedAt) {
    if (lastHistoryTime) {
      if (new Date(lastUpdatedAt).getTime() < new Date(lastHistoryTime).getTime()) {
        lastUpdatedAt = lastHistoryTime;
      }
    } else {
      const newLastUpdatedAt = new Date();
      lastUpdatedAt = newLastUpdatedAt.toISOString();
    }
  }

  const { data: streamData } = useSubscription(
    CURRENT_PAGE_ANNOTATIONS_STREAM,
    {
      variables: { lastUpdatedAt },
    },
  );
  const { pres_annotation_curr_stream: streamDataItem } = (streamData || []);

  if (streamDataItem) {
    if (new Date(lastUpdatedAt).getTime() < new Date(streamDataItem[0].lastUpdatedAt).getTime()) {
      if (streamDataItem[0].annotationInfo === '') {
        // remove shape
        annotations = annotations.filter(
          (annotation) => annotation.annotationId !== streamDataItem[0].annotationId,
        );
      } else {
        // add shape
        annotations = annotations.concat(streamDataItem);
      }
      lastUpdatedAt = streamDataItem[0].lastUpdatedAt;
    }
  }
  let shapes = {};
  let bgShape = [];

  if (!annotationsLoading && history) {
    const pageAnnotations = history
      .concat(annotations)
      .filter((annotation) => annotation.pageId === currentPresentationPage?.pageId);

    shapes = formatAnnotations(pageAnnotations, intl, curPageId, pollResults, currentPresentationPage);
  }

  const { isIphone } = deviceInfo;

  const assetId = AssetRecordType.createId(curPageId);
  const assets = [{
    id: assetId,
    typeName: "asset",
    type: 'image',
    meta: {},
    props: {
      w: currentPresentationPage?.scaledWidth,
      h: currentPresentationPage?.scaledHeight,
      src: currentPresentationPage?.svgUrl,
      name: "",
      isAnimated: false,
      mimeType: null,
    }
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
  const handleToggleFullScreen = (ref) => FullscreenService.toggleFullScreen(ref);
  const layoutContextDispatch = layoutDispatch();

  bgShape.push({
    x: 1,
    y: 1,
    rotation: 0,
    isLocked: true,
    opacity: 1,
    meta: {},
    id: `shape:BG-${curPageId}`,
    type: "image",
    props: {
      w: currentPresentationPage?.scaledWidth || 1,
      h: currentPresentationPage?.scaledHeight || 1,
      assetId: assetId,
      playing: true,
      url: "",
      crop: null,
    },
    parentId: `page:${curPageId}`,
    index: "a0",
    typeName: "shape",
  });

  const hasShapeAccess = (id) => {
    const owner = shapes[id]?.meta?.createdBy;
    const isBackgroundShape = id?.includes(':BG-');
    const isPollsResult = shapes[id]?.id?.includes('poll-result');
    const hasAccess = (!isBackgroundShape && !isPollsResult) 
      && ((owner && owner === currentUser?.userId) || (isPresenter) || (isModerator)) || !shapes[id];

    return hasAccess;
  };

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
        hasShapeAccess,
        handleToggleFullScreen,
        sidebarNavigationWidth,
        layoutContextDispatch,
        initDefaultPages,
        persistShape,
        isMultiUserActive,
        changeCurrentSlide,
        shapes,
        bgShape,
        assets,
        removeShapes,
        zoomSlide: PresentationToolbarService.zoomSlide,
        skipToSlide: PresentationToolbarService.skipToSlide,
        nextSlide: PresentationToolbarService.nextSlide,
        previousSlide: PresentationToolbarService.previousSlide,
        numberOfSlides: currentPresentationPage?.totalPages,
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
      }}
      {...props}
      meetingId={Auth.meetingID}
      publishCursorUpdate={CursorService.publishCursorUpdate}
      otherCursors={cursorArray}
      hideViewersCursor={meeting?.data?.lockSettings?.hideViewersCursor}
    />
  );
};

export default WhiteboardContainer;