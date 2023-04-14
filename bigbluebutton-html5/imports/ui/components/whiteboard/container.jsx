import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import {
  ColorStyle,
  DashStyle,
  SizeStyle,
  TDShapeType,
} from '@tldraw/tldraw';
import SettingsService from '/imports/ui/services/settings';
import {
  getShapes,
  getCurrentPres,
  initDefaultPages,
  persistShape,
  removeShapes,
  isMultiUserActive,
  hasMultiUserAccess,
  changeCurrentSlide,
  notifyNotAllowedChange,
  notifyShapeNumberExceeded,
  toggleToolsAnimations,
} from './service';
import Whiteboard from './component';
import { UsersContext } from '../components-data/users-context/context';
import Auth from '/imports/ui/services/auth';
import PresentationToolbarService from '../presentation/presentation-toolbar/service';
import { layoutSelect } from '../layout/context';
import FullscreenService from '/imports/ui/components/common/fullscreen-button/service';
import deviceInfo from '/imports/utils/deviceInfo';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;
const WHITEBOARD_CONFIG = Meteor.settings.public.whiteboard;

const WhiteboardContainer = (props) => {
  const usingUsersContext = useContext(UsersContext);
  const isRTL = layoutSelect((i) => i.isRTL);
  const width = layoutSelect((i) => i?.output?.presentation?.width);
  const height = layoutSelect((i) => i?.output?.presentation?.height);
  const sidebarNavigationWidth = layoutSelect((i) => i?.output?.sidebarNavigation?.width);
  const { users } = usingUsersContext;
  const currentUser = users[Auth.meetingID][Auth.userID];
  const isPresenter = currentUser.presenter;
  const isModerator = currentUser.role === ROLE_MODERATOR;
  const { maxStickyNoteLength, maxNumberOfAnnotations } = WHITEBOARD_CONFIG;
  const fontFamily = WHITEBOARD_CONFIG.styles.text.family;
  const handleToggleFullScreen = (ref) => FullscreenService.toggleFullScreen(ref);

  const { shapes } = props;
  const hasShapeAccess = (id) => {
    const owner = shapes[id]?.userId;
    const isBackgroundShape = id?.includes('slide-background');
    const hasAccess = !isBackgroundShape
      && ((owner && owner === currentUser?.userId) || !owner || isPresenter || isModerator);
    return hasAccess;
  };
  // set shapes as locked for those who aren't allowed to edit it
  Object.entries(shapes).forEach(([shapeId, shape]) => {
    if (!shape.isLocked && !hasShapeAccess(shapeId)) {
      const modShape = shape;
      modShape.isLocked = true;
    }
  });

  return (
    <Whiteboard
      {... {
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
      }}
      {...props}
      meetingId={Auth.meetingID}
    />
  );
};

export default withTracker(({
  whiteboardId,
  curPageId,
  intl,
  slidePosition,
  svgUri,
  podId,
  presentationId,
  darkTheme,
}) => {
  const shapes = getShapes(whiteboardId, curPageId, intl);
  const curPres = getCurrentPres();
  const { isIphone } = deviceInfo;

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

  const assets = {};
  assets[`slide-background-asset-${curPageId}`] = {
    id: `slide-background-asset-${curPageId}`,
    size: [slidePosition?.width || 0, slidePosition?.height || 0],
    src: svgUri,
    type: 'image',
  };

  return {
    initDefaultPages,
    persistShape,
    isMultiUserActive,
    hasMultiUserAccess,
    changeCurrentSlide,
    shapes,
    assets,
    curPres,
    removeShapes,
    zoomSlide: PresentationToolbarService.zoomSlide,
    skipToSlide: PresentationToolbarService.skipToSlide,
    nextSlide: PresentationToolbarService.nextSlide,
    previousSlide: PresentationToolbarService.previousSlide,
    numberOfSlides: PresentationToolbarService.getNumberOfSlides(podId, presentationId),
    notifyNotAllowedChange,
    notifyShapeNumberExceeded,
    darkTheme,
    whiteboardToolbarAutoHide: SettingsService?.application?.whiteboardToolbarAutoHide,
    animations: SettingsService?.application?.animations,
    toggleToolsAnimations,
    isIphone,
  };
})(WhiteboardContainer);

WhiteboardContainer.propTypes = {
  shapes: PropTypes.objectOf(PropTypes.shape).isRequired,
};
