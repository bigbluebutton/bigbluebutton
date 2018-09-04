import React from 'react';
import PropTypes from 'prop-types';

const ReactiveAnnotation = (props) => {
  const Component = props.drawObject;

  return (
    <Component
      version={props.annotation.version}
      annotation={props.annotation.annotationInfo}
      slideWidth={props.slideWidth}
      slideHeight={props.slideHeight}
      whiteboardId={props.whiteboardId}
    />
  );
};

ReactiveAnnotation.propTypes = {
  whiteboardId: PropTypes.string.isRequired,
  annotation: PropTypes.objectOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.object,
  ])).isRequired,
  drawObject: PropTypes.func.isRequired,
  slideWidth: PropTypes.number.isRequired,
  slideHeight: PropTypes.number.isRequired,
};

export default ReactiveAnnotation;
