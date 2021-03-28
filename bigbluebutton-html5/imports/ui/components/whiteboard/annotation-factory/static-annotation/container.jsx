import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import WhiteboardService from '../../service';
import StaticAnnotation from './component';
import StaticAnnotationService from './service';

const StaticAnnotationContainer = (props) => {
  return (
    <StaticAnnotation
      {...props}
    />
  );

  return null;
};

export default withTracker((params) => {
  const {
    whiteboardId,
    shapeId,
  } = params;
  
  const annotation = StaticAnnotationService.getAnnotationById(shapeId);
  const annotatorID = WhiteboardService.annotatorID(annotation);
  const hideAnnotationsForAnnotator = WhiteboardService.hideAnnotationsForAnnotator();
  const isPresenter = WhiteboardService.isPresenter();
  const haveWhiteboardAccess = WhiteboardService.hasAccessToWhiteboard(whiteboardId);
  const isAnnotationByPresenter = WhiteboardService.isHePresenter(annotatorID);
  const isMyAnnotation = WhiteboardService.currentUserID() == annotatorID;

  return {
    hidden: hideAnnotationsForAnnotator && !isPresenter && haveWhiteboardAccess && !isAnnotationByPresenter && !isMyAnnotation,
  };
})(StaticAnnotationContainer);

StaticAnnotationContainer.propTypes = {
  whiteboardId: PropTypes.string.isRequired,
  annotation: PropTypes.objectOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.object,
  ])),
  drawObject: PropTypes.func.isRequired,
  slideWidth: PropTypes.number.isRequired,
  slideHeight: PropTypes.number.isRequired,
};
