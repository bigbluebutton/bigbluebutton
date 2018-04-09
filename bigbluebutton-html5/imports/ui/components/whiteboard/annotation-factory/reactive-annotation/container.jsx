import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import ReactiveAnnotationService from './service';
import ReactiveAnnotation from './component';

const ReactiveAnnotationContainer = (props) => {
  if (props.annotation) {
    return (
      <ReactiveAnnotation
        annotation={props.annotation}
        slideWidth={props.slideWidth}
        slideHeight={props.slideHeight}
        drawObject={props.drawObject}
        whiteboardId={props.whiteboardId}
      />
    );
  }

  return null;
};

export default withTracker((params) => {
  const { shapeId } = params;
  const annotation = ReactiveAnnotationService.getAnnotationById(shapeId);

  return {
    annotation,
  };
})(ReactiveAnnotationContainer);

ReactiveAnnotationContainer.propTypes = {
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

ReactiveAnnotationContainer.defaultProps = {
  annotation: undefined,
};
