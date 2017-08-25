import React from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import ReactiveAnnotationService from './service';
import ReactiveAnnotation from './component';

const ReactiveAnnotationContainer = ({ ...props }) => (
  <ReactiveAnnotation
    annotation={props.annotation}
    slideWidth={props.slideWidth}
    slideHeight={props.slideHeight}
    drawObject={props.drawObject}
  />
);

export default createContainer((params) => {
  const { shapeId } = params;
  const annotation = ReactiveAnnotationService.getAnnotationById(shapeId);

  return {
    annotation,
  };
}, ReactiveAnnotationContainer);

ReactiveAnnotationContainer.propTypes = {
  annotation: PropTypes.objectOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.object,
  ])).isRequired,
  drawObject: PropTypes.instanceOf(Function).isRequired,
  slideWidth: PropTypes.number.isRequired,
  slideHeight: PropTypes.number.isRequired,
};
