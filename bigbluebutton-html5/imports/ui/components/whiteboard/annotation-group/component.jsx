import React from 'react';
import PropTypes from 'prop-types';
import Ellipse from '../annotations/ellipse/component';
import Line from '../annotations/line/component';
import Poll from '../annotations/poll/component';
import Rectangle from '../annotations/rectangle/component';
import Text from '../annotations/text/container';
import Triangle from '../annotations/triangle/component';
import Pencil from '../annotations/pencil/component';


export default class AnnotationGroup extends React.Component {
  constructor(props) {
    super(props);
    this.renderAnnotation = this.renderAnnotation.bind(this);
  }

  renderAnnotation(annotation, width, height) {
    const Component = this.props.annotationSelector[annotation.annotationType];

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
    }

    return null;
  }

  render() {
    const {
      annotations,
      width,
      height,
    } = this.props;

    return (
      <g>
        {annotations ?
          annotations.map(annotation => this.renderAnnotation(annotation, width, height))
        : null }
      </g>
    );
  }
}

AnnotationGroup.propTypes = {
  // initial width and height of the slide are required
  // to calculate the coordinates for each annotation
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,

  // array of annotations, optional
  annotations: PropTypes.arrayOf(PropTypes.object),
  annotationSelector: PropTypes.objectOf(PropTypes.instanceOf(Function)).isRequired,
};

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
