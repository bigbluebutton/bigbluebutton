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

const WhiteboardContainer = (props) => {
    const usingUsersContext = useContext(UsersContext);
    const { users } = usingUsersContext;
    const currentUser = users[Auth.meetingID][Auth.userID];
    const isPresenter = currentUser.presenter;
    return <Whiteboard {...{isPresenter, currentUser}} {...props} meetingId={Auth.meetingID} />
};

export default withTracker(({}) => {
  const shapes = Service.getShapes();
  const assets = Service.getAssets();
  return {
    initDefaultPages: Service.initDefaultPages,
    persistShape: Service.persistShape,
    persistAsset: Service.persistAsset,
    shapes: shapes,
    assets: assets,
    removeShape: Service.removeShape,
    publishCursorUpdate: Service.publishCursorUpdate,
  };
})(WhiteboardContainer);