import React, { useContext } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import {
  CURRENT_PRESENTATION_PAGE_SUBSCRIPTION,
  CURRENT_PAGE_ANNOTATIONS_QUERY,
  CURRENT_PAGE_ANNOTATIONS_STREAM,
} from './queries';
import { ColorStyle, DashStyle, SizeStyle, TDShapeType } from '@tldraw/tldraw';
import {
  initDefaultPages,
  persistShape,
  removeShapes,
  isMultiUserActive,
  hasMultiUserAccess,
  changeCurrentSlide,
  notifyNotAllowedChange,
  notifyShapeNumberExceeded,
  toggleToolsAnimations,
  formatAnnotations,
} from './service';
import PresentationToolbarService from '../presentation/presentation-toolbar/service';
import SettingsService from '/imports/ui/services/settings';
import { UsersContext } from '../components-data/users-context/context';
import Auth from '/imports/ui/services/auth';
import {
  layoutSelect,
  layoutDispatch,
} from '/imports/ui/components/layout/context';
import FullscreenService from '/imports/ui/components/common/fullscreen-button/service';
import deviceInfo from '/imports/utils/deviceInfo';
import Whiteboard from './component';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;
const WHITEBOARD_CONFIG = Meteor.settings.public.whiteboard;
const PRESENTATION_CONFIG = Meteor.settings.public.presentation;

let annotations = [];
let lastUpdatedAt = null;

const WhiteboardContainer = (props) => {
  const {
    whiteboardId,
    intl,
    slidePosition,
    svgUri,
    podId,
    darkTheme,
  } = props;

  const { data: presentationPageData } = useSubscription(CURRENT_PRESENTATION_PAGE_SUBSCRIPTION);
  const { pres_page_curr: presentationPageArray } = (presentationPageData || {});
  const currentPresentationPage = presentationPageArray && presentationPageArray[0];
  const curPageId = currentPresentationPage?.num;
  const presentationId = currentPresentationPage?.presentationId;

  const {
    loading: annotationsLoading,
    data: annotationsData,
  } = useQuery(CURRENT_PAGE_ANNOTATIONS_QUERY);
  let { pres_annotation_curr: history } = (annotationsData || []);

  const lastHistoryTime = history?.[0]?.lastUpdatedAt || null;

  if (!lastUpdatedAt) {
    if(lastHistoryTime){
      if (new Date(lastUpdatedAt).getTime() < new Date(lastHistoryTime).getTime()) {
        lastUpdatedAt = lastHistoryTime;
      }
    }else{
      const newLastUpdatedAt = new Date();
      lastUpdatedAt = newLastUpdatedAt.toISOString();
    }
  }

  const { data: streamData } = useSubscription(
    CURRENT_PAGE_ANNOTATIONS_STREAM,
    {
      variables: { lastUpdatedAt },
    }
  );
  const { pres_annotation_curr_stream: streamDataItem } = (streamData || []);

  if (streamDataItem) {
    if (new Date(lastUpdatedAt).getTime() < new Date(streamDataItem[0].lastUpdatedAt).getTime()) {
      annotations = annotations.concat(streamDataItem);
      lastUpdatedAt = streamDataItem[0].lastUpdatedAt;
    }
  }
  let shapes = {};

  if (!annotationsLoading && history) {
    const pageAnnotations = history.concat(annotations).filter((annotation) => annotation.pageId === currentPresentationPage.pageId);

    shapes = formatAnnotations(pageAnnotations, intl, curPageId);
  }

  const { isIphone } = deviceInfo;

  const assets = {};
  assets[`slide-background-asset-${curPageId}`] = {
    id: `slide-background-asset-${curPageId}`,
    size: [slidePosition?.width || 0, slidePosition?.height || 0],
    src: svgUri,
    type: 'image',
  };

  const usingUsersContext = useContext(UsersContext);
  const isRTL = layoutSelect((i) => i.isRTL);
  const width = layoutSelect((i) => i?.output?.presentation?.width);
  const height = layoutSelect((i) => i?.output?.presentation?.height);
  const sidebarNavigationWidth = layoutSelect(
    (i) => i?.output?.sidebarNavigation?.width
  );
  const { users } = usingUsersContext;
  const currentUser = users[Auth.meetingID][Auth.userID];
  const isPresenter = currentUser.presenter;
  const isModerator = currentUser.role === ROLE_MODERATOR;
  const { maxStickyNoteLength, maxNumberOfAnnotations } = WHITEBOARD_CONFIG;
  const fontFamily = WHITEBOARD_CONFIG.styles.text.family;
  const handleToggleFullScreen = (ref) =>
    FullscreenService.toggleFullScreen(ref);
  const layoutContextDispatch = layoutDispatch();

  shapes['slide-background-shape'] = {
    assetId: `slide-background-asset-${curPageId}`,
    childIndex: -1,
    id: 'slide-background-shape',
    name: 'Image',
    type: TDShapeType.Image,
    parentId: `${curPageId}`,
    point: [0, 0],
    isLocked: true,
    size: [slidePosition?.width || 0, slidePosition?.height || 0],
    style: {
      dash: DashStyle.Draw,
      size: SizeStyle.Medium,
      color: ColorStyle.Blue,
    },
  };

  if (!presentationId || !currentPresentationPage) {
    return null;
  }

  const hasShapeAccess = (id) => {
    const owner = shapes[id]?.userId;
    const isBackgroundShape = id?.includes('slide-background');
    const isPollsResult = shapes[id]?.name?.includes('poll-result');
    const hasAccess =
      (!isBackgroundShape && !isPollsResult) ||
      (isPresenter &&
        ((owner && owner === currentUser?.userId) ||
          !owner ||
          isPresenter ||
          isModerator));

    return hasAccess;
  };
  // set shapes as locked for those who aren't allowed to edit it
  Object.entries(shapes).forEach(([shapeId, shape]) => {
    if (!shape.isLocked && !hasShapeAccess(shapeId) && !shape.name?.includes('poll-result')) {
      const modShape = shape;
      modShape.isLocked = true;
    }
  });

  return <Whiteboard
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
    hasMultiUserAccess,
    changeCurrentSlide,
    shapes,
    assets,
    removeShapes,
    zoomSlide: PresentationToolbarService.zoomSlide,
    skipToSlide: PresentationToolbarService.skipToSlide,
    nextSlide: PresentationToolbarService.nextSlide,
    previousSlide: PresentationToolbarService.previousSlide,
    numberOfSlides: PresentationToolbarService.getNumberOfSlides(
      podId,
      presentationId
    ),
    notifyNotAllowedChange,
    notifyShapeNumberExceeded,
    whiteboardToolbarAutoHide:
      SettingsService?.application?.whiteboardToolbarAutoHide,
    animations: SettingsService?.application?.animations,
    toggleToolsAnimations,
    isIphone,
    currentPresentationPage,
    numberOfPages: PRESENTATION_CONFIG.mirroredFromBBBCore.uploadPagesMax,
    presentationId,
  }}
  {...props}
  meetingId={Auth.meetingID}
  />;
}

export default WhiteboardContainer;
