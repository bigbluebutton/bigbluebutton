import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import WhiteboardToolbarService from './service';
import WhiteboardToolbar from './component';

const WhiteboardToolbarContainer = props => (
  <WhiteboardToolbar {...props} />
);

export default withTracker(() => ({
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
  multiUser: WhiteboardToolbarService.getMultiUserStatus(),
  isPresenter: WhiteboardToolbarService.isPresenter(),
}))(WhiteboardToolbarContainer);
