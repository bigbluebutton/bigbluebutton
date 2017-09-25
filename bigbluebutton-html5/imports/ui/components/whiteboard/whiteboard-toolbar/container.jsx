import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import WhiteboardToolbarService from './service';
import WhiteboardToolbar from './component';

const WhiteboardToolbarContainer = ({ ...props }) => (
  <WhiteboardToolbar {...props} />
  );

export default createContainer(() => ({
  actions: WhiteboardToolbarService.actions,
  textShapeActiveId: WhiteboardToolbarService.getTextShapeActiveId(),
  multiUser: WhiteboardToolbarService.getMultiUserStatus(),
  isPresenter: WhiteboardToolbarService.isPresenter(),
}), WhiteboardToolbarContainer);
