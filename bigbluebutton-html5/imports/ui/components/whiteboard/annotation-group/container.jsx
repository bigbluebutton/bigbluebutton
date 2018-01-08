import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import AnnotationGroupService from './service';
import AnnotationGroup from './component';

const AnnotationGroupContainer = props => (
  <AnnotationGroup
    annotationsInfo={props.annotationsInfo}
    slideWidth={props.width}
    slideHeight={props.height}
  />
);

export default withTracker((params) => {
  const { whiteboardId } = params;
  const annotationsInfo = AnnotationGroupService.getCurrentAnnotationsInfo(whiteboardId);

  return {
    annotationsInfo,
  };
})(AnnotationGroupContainer);

AnnotationGroupContainer.propTypes = {
  // initial width and height of the slide; required to calculate the annotations' coordinates
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,

  // array of annotations, optional
  annotationsInfo: PropTypes.arrayOf(PropTypes.shape({
    status: PropTypes.string.isRequired,
    _id: PropTypes.string.isRequired,
    annotationType: PropTypes.string.isRequired,
  })).isRequired,
};
