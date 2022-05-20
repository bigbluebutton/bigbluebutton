import { withTracker } from "meteor/react-meteor-data";
import Service from "./service";
import Whiteboard from "./component";
import React, { useContext } from "react";
import { UsersContext } from "../components-data/users-context/context";
import Auth from "/imports/ui/services/auth";
import PresentationToolbarService from '../presentation/presentation-toolbar/service';

const WhiteboardContainer = (props) => {
    const usingUsersContext = useContext(UsersContext);
    const { users } = usingUsersContext;
    const currentUser = users[Auth.meetingID][Auth.userID];
    const isPresenter = currentUser.presenter;
    return <Whiteboard {...{isPresenter, currentUser}} {...props} meetingId={Auth.meetingID} />
};

export default withTracker(({ whiteboardId }) => {
  const shapes = Service.getShapes(whiteboardId);
  const assets = Service.getAssets();
  const curPres = Service.getCurrentPres();

  return {
    initDefaultPages: Service.initDefaultPages,
    persistShape: Service.persistShape,
    persistAsset: Service.persistAsset,
    isMultiUserActive: Service.isMultiUserActive,
    hasMultiUserAccess: Service.hasMultiUserAccess,
    changeCurrentSlide: Service.changeCurrentSlide,
    shapes: shapes,
    assets: assets,
    curPres,
    removeShapes: Service.removeShapes,
    zoomSlide: PresentationToolbarService.zoomSlide,
    skipToSlide: PresentationToolbarService.skipToSlide,
  };
})(WhiteboardContainer);
