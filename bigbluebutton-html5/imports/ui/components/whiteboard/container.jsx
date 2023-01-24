import { withTracker } from "meteor/react-meteor-data";
import Service from "./service";
import Whiteboard from "./component";
import React, { useContext } from "react";
import { UsersContext } from "../components-data/users-context/context";
import Auth from "/imports/ui/services/auth";
import PresentationToolbarService from '../presentation/presentation-toolbar/service';
import { layoutSelect } from '../layout/context';
import {
  ColorStyle,
  DashStyle,
  SizeStyle,
  TDShapeType,
} from "@tldraw/tldraw";

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;
const WHITEBOARD_CONFIG = Meteor.settings.public.whiteboard;

const WhiteboardContainer = (props) => {
    const usingUsersContext = useContext(UsersContext);
    const isRTL = layoutSelect((i) => i.isRTL);
    const width = layoutSelect((i) => i?.output?.presentation?.width);
    const height = layoutSelect((i) => i?.output?.presentation?.height);
    const { users } = usingUsersContext;
    const currentUser = users[Auth.meetingID][Auth.userID];
    const isPresenter = currentUser.presenter;
    const isModerator = currentUser.role === ROLE_MODERATOR;
    const maxStickyNoteLength = WHITEBOARD_CONFIG.maxStickyNoteLength;
    const fontFamily = WHITEBOARD_CONFIG.styles.text.family;
    return <Whiteboard {...{ isPresenter, isModerator, currentUser, isRTL, width, height, maxStickyNoteLength, fontFamily }} {...props} meetingId={Auth.meetingID} />
};

export default withTracker(({ whiteboardId, curPageId, intl, zoomChanger, slidePosition, svgUri }) => {
  const shapes = Service.getShapes(whiteboardId, curPageId, intl);
  const curPres = Service.getCurrentPres();

  shapes["slide-background-shape"] = {
    assetId: `slide-background-asset-${curPageId}`,
    childIndex: -1,
    id: "slide-background-shape",
    name: "Image",
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

  const assets = {}
  assets[`slide-background-asset-${curPageId}`] = {
    id: `slide-background-asset-${curPageId}`,
    size: [slidePosition?.width || 0, slidePosition?.height || 0],
    src: svgUri,
    type: "image",
  };

  return {
    initDefaultPages: Service.initDefaultPages,
    persistShape: Service.persistShape,
    isMultiUserActive: Service.isMultiUserActive,
    hasMultiUserAccess: Service.hasMultiUserAccess,
    changeCurrentSlide: Service.changeCurrentSlide,
    shapes: shapes,
    assets: assets,
    curPres,
    removeShapes: Service.removeShapes,
    zoomSlide: PresentationToolbarService.zoomSlide,
    skipToSlide: PresentationToolbarService.skipToSlide,
    zoomChanger: zoomChanger,
    notifyNotAllowedChange: Service.notifyNotAllowedChange,
  };
})(WhiteboardContainer);
