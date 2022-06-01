import { withTracker } from "meteor/react-meteor-data";
import React from "react";
import Cursors from "./component";
import Service from "./service";

const CursorsContainer = (props) => {
  return <Cursors {...props}/>
};

export default withTracker(({ currentUser, tldrawAPI, whiteboardId }) => {
  return { 
    currentUser,
    publishCursorUpdate: Service.publishCursorUpdate,
    otherCursors: Service.getCurrentCursors(whiteboardId),
    tldrawAPI,
  };
})(CursorsContainer);
