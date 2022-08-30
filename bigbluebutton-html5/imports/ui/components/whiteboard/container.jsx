import { withTracker } from "meteor/react-meteor-data";
import Service from "./service";
import Whiteboard from "./component";
import React, { useContext } from "react";
import { UsersContext } from "../components-data/users-context/context";
import Auth from "/imports/ui/services/auth";
import PresentationToolbarService from '../presentation/presentation-toolbar/service';
import { layoutSelect } from '../layout/context';

const WhiteboardContainer = (props) => {
    const usingUsersContext = useContext(UsersContext);
    const isRTL = layoutSelect((i) => i.isRTL);
    const width = layoutSelect((i) => i?.output?.presentation?.width);
    const height = layoutSelect((i) => i?.output?.presentation?.height);
    const { users } = usingUsersContext;
    const currentUser = users[Auth.meetingID][Auth.userID];
    const isPresenter = currentUser.presenter;
    return <Whiteboard {...{ isPresenter, currentUser, isRTL, width, height }} {...props} meetingId={Auth.meetingID} />
};

export default withTracker(({ whiteboardId, curPageId, intl, zoomChanger }) => {
  const shapes = Service.getShapes(whiteboardId, curPageId, intl);
  const curPres = Service.getCurrentPres();

  return {
    initDefaultPages: Service.initDefaultPages,
    persistShape: Service.persistShape,
    isMultiUserActive: Service.isMultiUserActive,
    hasMultiUserAccess: Service.hasMultiUserAccess,
    changeCurrentSlide: Service.changeCurrentSlide,
    shapes: shapes,
    curPres,
    removeShapes: Service.removeShapes,
    zoomSlide: PresentationToolbarService.zoomSlide,
    skipToSlide: PresentationToolbarService.skipToSlide,
    zoomChanger: zoomChanger,
  };
})(WhiteboardContainer);
