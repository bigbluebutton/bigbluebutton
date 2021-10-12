import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import AnnotationGroupService from './service';
import AnnotationGroup from './component';

const AnnotationGroupContainer = ({
  annotationsInfo, width, height, whiteboardId,
}) => (
  <AnnotationGroup
    annotationsInfo={annotationsInfo}
    slideWidth={width}
    slideHeight={height}
    whiteboardId={whiteboardId}
  />
);

export default withTracker((params) => {
  const {
    whiteboardId,
    published,
  } = params;

  const fetchFunc = published
    ? AnnotationGroupService.getCurrentAnnotationsInfo : AnnotationGroupService.getUnsetAnnotations;

  const annotationsInfo = fetchFunc(whiteboardId);
  return {
    annotationsInfo,
  };
})(AnnotationGroupContainer);

AnnotationGroupContainer.propTypes = {
  whiteboardId: PropTypes.string.isRequired,
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
