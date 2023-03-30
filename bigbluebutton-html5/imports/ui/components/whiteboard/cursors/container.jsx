import { withTracker } from 'meteor/react-meteor-data';
import React from 'react';
import SettingsService from '/imports/ui/services/settings';
import _ from 'lodash';
import Cursors from './component';
import Service from './service';

const CursorsContainer = (props) => <Cursors {..._.omit(props, ['tldrawAPI'])} />;

export default withTracker((params) => (
  {
    application: SettingsService?.application,
    currentUser: params.currentUser,
    publishCursorUpdate: Service.publishCursorUpdate,
    otherCursors: Service.getCurrentCursors(params.whiteboardId),
    currentPoint: params.tldrawAPI?.currentPoint,
    tldrawCamera: params.tldrawAPI?.getPageState().camera,
    isViewersCursorLocked: params.isViewersCursorLocked,
    hasMultiUserAccess: params.hasMultiUserAccess,
    isMultiUserActive: params.isMultiUserActive,
  }
))(CursorsContainer);
