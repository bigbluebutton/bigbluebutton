import { withTracker } from "meteor/react-meteor-data";
import React from "react";
import Cursors from "./component";
import Service from "./service";

const CursorsContainer = (props) => {
  return <Cursors {...props}/>
};

export default
  withTracker((params) => {
    return { 
      currentUser: params.currentUser,
      publishCursorUpdate: Service.publishCursorUpdate,
      otherCursors: Service.getCurrentCursors(params.whiteboardId),
      tldrawAPI: params.tldrawAPI,
      isViewersCursorLocked: params.isViewersCursorLocked,
      hasMultiUserAccess: params.hasMultiUserAccess,
    };
  })(CursorsContainer)
;
