import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';

import AnnotationGroupService from './service';
import AnnotationGroup from './component';

const propTypes = {
  // the id is required to fetch the annotations
  whiteboardId: PropTypes.string.isRequired,

  // initial width and height of the slide are required to calculate the coordinates for each annotation
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,

  // array of annotations, optional
  annotations: PropTypes.array,
};

class AnnotationGroupContainer extends React.Component {
  constructor(props) {
    super(props);
  }

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

AnnotationGroupContainer.propTypes = propTypes;
