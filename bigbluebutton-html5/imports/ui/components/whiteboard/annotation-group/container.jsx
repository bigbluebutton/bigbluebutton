import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';

import AnnotationGroupService from './service';
import AnnotationGroup from './component';

class AnnotationGroupContainer extends Component {

  render() {
    return (
      <AnnotationGroup
        annotations={this.props.annotations}
        width={this.props.width}
        height={this.props.height}
      />
    );
  }
}

export default createContainer((params) => {
  const { whiteboardId, width, height } = params;
  const annotations = AnnotationGroupService.getCurrentAnnotations(whiteboardId);

  return {
    annotations,
    width,
    height,
  };
}, AnnotationGroupContainer);

AnnotationGroupContainer.propTypes = {
  // initial width and height of the slide; required to calculate the annotations' coordinates
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,

  // array of annotations, optional
  annotations: PropTypes.arrayOf(PropTypes.object),
};
