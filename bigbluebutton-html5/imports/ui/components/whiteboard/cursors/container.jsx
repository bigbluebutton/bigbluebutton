import { withTracker } from "meteor/react-meteor-data";
import React from "react";
import SettingsService from '/imports/ui/services/settings';
import Cursors from "./component";
import Service from "./service";

const CursorsContainer = (props) => {
  return <Cursors {...props}/>
};

export default
  withTracker((params) => {
    return { 
      application: SettingsService?.application,
      currentUser: params.currentUser,
      publishCursorUpdate: Service.publishCursorUpdate,
      otherCursors: Service.getCurrentCursors(params.whiteboardId),
      tldrawAPI: params.tldrawAPI,
      isViewersCursorLocked: params.isViewersCursorLocked,
      hasMultiUserAccess: params.hasMultiUserAccess,
      isMultiUserActive: params.isMultiUserActive,
    };
  })(CursorsContainer)
;
