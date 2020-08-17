import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import WhiteboardToolbarService from './service';
import WhiteboardToolbar from './component';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';

const WhiteboardToolbarContainer = props => (
  <WhiteboardToolbar {...props} />
);

export default withTracker((params) => {
  const { whiteboardId } = params;

  const withAccessNum = Users.find({
    meetingId: Auth.meetingID,
    whiteboardAccess: true,
    connectionStatus: 'online',
    presenter: false,
  }, {
    fields: {
      id: 1,
    },
  }).fetch().length;

  const data = {
    actions: {
      undoAnnotation: WhiteboardToolbarService.undoAnnotation,
      clearWhiteboard: WhiteboardToolbarService.clearWhiteboard,
      changeWhiteboardMode: WhiteboardToolbarService.changeWhiteboardMode,
      setInitialWhiteboardToolbarValues: WhiteboardToolbarService.setInitialWhiteboardToolbarValues,
      getCurrentDrawSettings: WhiteboardToolbarService.getCurrentDrawSettings,
      setFontSize: WhiteboardToolbarService.setFontSize,
      setTool: WhiteboardToolbarService.setTool,
      setThickness: WhiteboardToolbarService.setThickness,
      setColor: WhiteboardToolbarService.setColor,
      setTextShapeObject: WhiteboardToolbarService.setTextShapeObject,
    },
    textShapeActiveId: WhiteboardToolbarService.getTextShapeActiveId(),
    multiUser: WhiteboardToolbarService.getMultiUserStatus(whiteboardId),
    isPresenter: WhiteboardToolbarService.isPresenter(),
    annotations: WhiteboardToolbarService.filterAnnotationList(),
    isMeteorConnected: Meteor.status().connected,
    withAccessNum,
  };

  return data;
})(WhiteboardToolbarContainer);
