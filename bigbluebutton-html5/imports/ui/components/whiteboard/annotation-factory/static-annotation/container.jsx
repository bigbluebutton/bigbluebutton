import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import StaticAnnotation from './component';
import StaticAnnotationService from './service';

const StaticAnnotationContainer = (props) => {
  return (
    <StaticAnnotation
      {...props}
    />
  );
};

export default withTracker((params) => {
  const {
    shapeId,
  } = params;

  const annotation = StaticAnnotationService.getAnnotationById(shapeId);

  return {
    // This is necessary to real-time update the movement
    version: annotation.version,
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
