import { withTracker } from 'meteor/react-meteor-data';
import React, { useContext } from 'react';
import {
  ColorStyle,
  DashStyle,
  SizeStyle,
  TDShapeType,
} from '@tldraw/tldraw';
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
} from './service';
import Whiteboard from './component';
import { UsersContext } from '../components-data/users-context/context';
import Auth from '/imports/ui/services/auth';
import PresentationToolbarService from '../presentation/presentation-toolbar/service';
import { layoutSelect } from '../layout/context';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;
const WHITEBOARD_CONFIG = Meteor.settings.public.whiteboard;

const WhiteboardContainer = (props) => {
  const usingUsersContext = useContext(UsersContext);
  const isRTL = layoutSelect((i) => i.isRTL);
  let width = layoutSelect((i) => i?.output?.presentation?.width);
  let height = layoutSelect((i) => i?.output?.presentation?.height);
  const { users } = usingUsersContext;
  const currentUser = users[Auth.meetingID][Auth.userID];
  const isPresenter = currentUser.presenter;
  const isModerator = currentUser.role === ROLE_MODERATOR;
  const { maxStickyNoteLength } = WHITEBOARD_CONFIG;
  const fontFamily = WHITEBOARD_CONFIG.styles.text.family;

  if (props.isPresentationDetached) {
    width = props.presentationWindow.document.firstChild.clientWidth;
    height = props.presentationWindow.document.firstChild.clientHeight;
  }

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
      shape.isLocked = true;
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
        fontFamily,
        hasShapeAccess,
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
}) => {
  const shapes = getShapes(whiteboardId, curPageId, intl);
  const curPres = getCurrentPres();

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
    notifyNotAllowedChange,
  };
})(WhiteboardContainer);
