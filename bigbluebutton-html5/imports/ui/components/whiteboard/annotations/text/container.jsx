import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import TextShapeService from './service';
import TextDrawComponent from './component';
import WhiteboardService from '/imports/ui/components/whiteboard/service';

const TextDrawContainer = props => (
  <TextDrawComponent {...props} />
);

export default withTracker((params) => {
  const { whiteboardId } = params;
  const isPresenter = TextShapeService.isPresenter();
  const isMultiUser = WhiteboardService.isMultiUserActive(whiteboardId);
  const activeTextShapeId = TextShapeService.activeTextShapeId();
  let isActive = false;

  if ((isPresenter || isMultiUser) && activeTextShapeId === params.annotation.id) {
    isActive = true;
  }
  return {
    isActive,
    setTextShapeValue: TextShapeService.setTextShapeValue,
    resetTextShapeActiveId: TextShapeService.resetTextShapeActiveId,
  };
})(TextDrawContainer);
