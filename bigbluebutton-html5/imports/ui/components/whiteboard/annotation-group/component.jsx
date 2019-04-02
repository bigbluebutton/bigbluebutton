import React from 'react';
import PropTypes from 'prop-types';
import AnnotationFactory from '../annotation-factory/component';

const AnnotationGroup = props => (
  <AnnotationFactory
    annotationsInfo={props.annotationsInfo}
    slideWidth={props.slideWidth}
    slideHeight={props.slideHeight}
    whiteboardId={props.whiteboardId}
  />
);

AnnotationGroup.propTypes = {
  whiteboardId: PropTypes.string.isRequired,
  // initial width and height of the slide are required
  // to calculate the coordinates for each annotation
  slideWidth: PropTypes.number.isRequired,
  slideHeight: PropTypes.number.isRequired,

  // array of annotations, optional
  annotationsInfo: PropTypes.arrayOf(PropTypes.shape({
    status: PropTypes.string.isRequired,
    _id: PropTypes.string.isRequired,
    annotationType: PropTypes.string.isRequired,
  })).isRequired,
};

export default AnnotationGroup;
