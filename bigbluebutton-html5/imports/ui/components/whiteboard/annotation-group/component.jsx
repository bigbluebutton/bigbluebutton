import React, { Component } from 'react';
import PropTypes from 'prop-types';
import WhiteboardAnnotationModel from '../annotation-factory/component';

const propTypes = {
  // initial width and height of the slide are required to calculate the coordinates for each annotation
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,

  // array of annotations, optional
  annotations: PropTypes.array,
};

export default class AnnotationGroup extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      annotations,
      width,
      height,
    } = this.props;

    return (
      <g>
        {annotations ? annotations.map(annotation =>
          (<WhiteboardAnnotationModel
            annotation={annotation}
            key={annotation.id}
            slideWidth={width}
            slideHeight={height}
          />),
          )
        : null }
      </g>
    );
  }
}

AnnotationGroup.propTypes = propTypes;
