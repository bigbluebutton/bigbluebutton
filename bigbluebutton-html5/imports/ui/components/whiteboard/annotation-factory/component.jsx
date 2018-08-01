import React, { Component } from 'react';
import PropTypes from 'prop-types';
import StaticAnnotation from './static-annotation/component';
import ReactiveAnnotationContainer from './reactive-annotation/container';
import Ellipse from '../annotations/ellipse/component';
import Line from '../annotations/line/component';
import Poll from '../annotations/poll/component';
import Rectangle from '../annotations/rectangle/component';
import Text from '../annotations/text/container';
import Triangle from '../annotations/triangle/component';
import Pencil from '../annotations/pencil/component';

const ANNOTATION_CONFIG = Meteor.settings.public.whiteboard.annotations;
const DRAW_END = ANNOTATION_CONFIG.status.end;

export default class AnnotationFactory extends Component {
  static renderStaticAnnotation(annotationInfo, slideWidth, slideHeight, drawObject, whiteboardId) {
    return (
      <StaticAnnotation
        key={annotationInfo._id}
        shapeId={annotationInfo._id}
        drawObject={drawObject}
        slideWidth={slideWidth}
        slideHeight={slideHeight}
        whiteboardId={whiteboardId}
      />
    );
  }

  static renderReactiveAnnotation(annotationInfo, slideWidth, slideHeight, drawObject, whiteboardId) {
    return (
      <ReactiveAnnotationContainer
        key={annotationInfo._id}
        shapeId={annotationInfo._id}
        drawObject={drawObject}
        slideWidth={slideWidth}
        slideHeight={slideHeight}
        whiteboardId={whiteboardId}
      />
    );
  }

  constructor() {
    super();
    this.renderAnnotation = this.renderAnnotation.bind(this);
  }

  renderAnnotation(annotationInfo) {
    const drawObject = this.props.annotationSelector[annotationInfo.annotationType];

    if (annotationInfo.status === DRAW_END) {
      return AnnotationFactory.renderStaticAnnotation(
        annotationInfo,
        this.props.slideWidth,
        this.props.slideHeight,
        drawObject,
        this.props.whiteboardId,
      );
    }
    return AnnotationFactory.renderReactiveAnnotation(
      annotationInfo,
      this.props.slideWidth,
      this.props.slideHeight,
      drawObject,
      this.props.whiteboardId,
    );
  }

  render() {
    const { annotationsInfo } = this.props;
    return (
      <g>
        {annotationsInfo ?
          annotationsInfo.map(annotationInfo => this.renderAnnotation(annotationInfo))
        : null }
      </g>
    );
  }
}

AnnotationFactory.propTypes = {
  whiteboardId: PropTypes.string.isRequired,
  // initial width and height of the slide are required
  // to calculate the coordinates for each annotation
  slideWidth: PropTypes.number.isRequired,
  slideHeight: PropTypes.number.isRequired,

  // array of annotations, optional
  annotationsInfo: PropTypes.arrayOf(PropTypes.object).isRequired,
  annotationSelector: PropTypes.objectOf(PropTypes.func).isRequired,
};

AnnotationFactory.defaultProps = {
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
