// import { withTracker } from "meteor/react-meteor-data";
// import Service from "./service";
// import Whiteboard from "./component";
// import React, { useContext } from "react";
// import { UsersContext } from "../components-data/users-context/context";
// import Auth from "/imports/ui/services/auth";

// const WhiteboardContainer = (props) => {
//     const usingUsersContext = useContext(UsersContext);
//     const { users } = usingUsersContext;
//     const currentUser = users[Auth.meetingID][Auth.userID];
//     const isPresenter = currentUser.presenter;
//     return <Whiteboard {...{isPresenter}} {...props} meetingId={Auth.meetingID} />
// };

// export default withTracker(({}) => {
//   const shapes = Service.getShapes();
//   return { 
//     initDefaultPages: Service.initDefaultPages,
//     persistShape: Service.persistShape,
//     shapes: shapes,
//   };
// })(WhiteboardContainer);

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
  const curSlide = Service.getCurSlide();

  //console.log("!!! withTracker !!! ")
  // console.log('container shapes', shapes)

  return {
    initDefaultPages: Service.initDefaultPages,
    persistShape: Service.persistShape,
    persistAsset: Service.persistAsset,
    changeCurrentSlide: Service.changeCurrentSlide,
    curSlide,
    shapes: shapes,
    assets: assets,
    curPres,
    removeShapes: Service.removeShapes,
    zoomSlide: PresentationToolbarService.zoomSlide,
  };
})(WhiteboardContainer);
