import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Ellipse from '../annotations/ellipse/component.jsx';
import Line from '../annotations/line/component.jsx';
import Poll from '../annotations/poll/component.jsx';
import Rectangle from '../annotations/rectangle/component.jsx';
import Text from '../annotations/text/container.jsx';
import Triangle from '../annotations/triangle/component.jsx';
import Pencil from '../annotations/pencil/component.jsx';

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
    this.renderAnnotation = this.renderAnnotation.bind(this);
  }

  renderAnnotation(annotation, width, height) {
    let Component = this.props.annotationSelector[annotation.annotationType];

    if (Component != null) {
      return (
        <Component
          key={annotation.id}
          version={annotation.version}
          annotation={annotation.annotationInfo}
          slideWidth={width}
          slideHeight={height}
        />
      );
    } else {
      console.error('Unexpected shape type received: ' + annotation.annotationType);
      return (
        <g key={annotation.id}></g>
      );
    }
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
            this.renderAnnotation(annotation, width, height)
          )
        : null }
      </g>
    );
  }
}

AnnotationGroup.propTypes = propTypes;

AnnotationGroup.defaultProps = {
  annotationSelector: {
    ellipse: Ellipse,
    line: Line,
    poll_result: Poll,
    rectangle: Rectangle,
    text: Text,
    triangle: Triangle,
    pencil: Pencil,
  },
};
