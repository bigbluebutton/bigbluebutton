import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AnnotationHelpers from '../helpers';

export default class PencilDrawComponent extends Component {
  static getInitialCoordinates(annotation, slideWidth, slideHeight) {
    const { points } = annotation;
    let i = 2;
    let path = '';
    if (points && points.length >= 2) {
      path = `M${(points[0] / 100) * slideWidth
      }, ${(points[1] / 100) * slideHeight}`;
      while (i < points.length) {
        path = `${path} L${(points[i] / 100) * slideWidth
        }, ${(points[i + 1] / 100) * slideHeight}`;
        i += 2;
      }
    }

    return { path, points };
  }

  static getFinalCoordinates(annotation, slideWidth, slideHeight) {
    const { points, commands } = annotation;

    let path = '';
    let i;
    let j;
    for (i = 0, j = 0; i < commands.length; i += 1) {
      switch (commands[i]) {
        // MOVE_TO - consumes 1 pair of values
        case 1:
          path = `${path} M${(points[j] / 100) * slideWidth} ${(points[j + 1] / 100) * slideHeight}`;
          j += 2;
          break;

          // LINE_TO - consumes 1 pair of values
        case 2:
          path = `${path} L${(points[j] / 100) * slideWidth} ${(points[j + 1] / 100) * slideHeight}`;
          j += 2;
          break;

          // QUADRATIC_CURVE_TO - consumes 2 pairs of values
          // 1st pair is a control point, second is a coordinate
        case 3:
          path = `${path} Q${(points[j] / 100) * slideWidth}, ${
            (points[j + 1] / 100) * slideHeight}, ${(points[j + 2] / 100) * slideWidth}, ${
            (points[j + 3] / 100) * slideHeight}`;
          j += 4;
          break;

          // CUBIC_CURVE_TO - consumes 3 pairs of values
          // 1st and 2nd are control points, 3rd is an end coordinate
        case 4:
          path = `${path} C${(points[j] / 100) * slideWidth}, ${
            (points[j + 1] / 100) * slideHeight}, ${(points[j + 2] / 100) * slideWidth}, ${
            (points[j + 3] / 100) * slideHeight}, ${(points[j + 4] / 100) * slideWidth}, ${
            (points[j + 5] / 100) * slideHeight}`;
          j += 6;
          break;

        default:
          break;
      }
    }

    // If that's just one coordinate at the end (dot) - we want to display it.
    // So adding L with the same X and Y values to the path
    if (path && points.length === 2) {
      path = `${path} L${(points[0] / 100) * slideWidth} ${(points[1] / 100) * slideHeight}`;
    }

    return { path, points };
  }

  constructor(props) {
    super(props);

    const { annotation, slideWidth, slideHeight } = this.props;

    this.path = this.getCoordinates(annotation, slideWidth, slideHeight);

    this.getCurrentPath = this.getCurrentPath.bind(this);
    this.getCoordinates = this.getCoordinates.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return this.props.version !== nextProps.version;
  }

  componentWillUpdate(nextProps) {
    const { annotation, slideWidth, slideHeight } = nextProps;
    if (annotation.points.length !== this.props.annotation.points.length) {
      this.path = this.getCoordinates(annotation, slideWidth, slideHeight);
    }
  }

  getCoordinates(annotation, slideWidth, slideHeight) {
    if ((!annotation || annotation.points.length === 0)
        || (annotation.status === 'DRAW_END' && !annotation.commands)) {
      return undefined;
    }

    let data;
    // Final message, display smoothes coordinates
    if (annotation.status === 'DRAW_END') {
      data = PencilDrawComponent.getFinalCoordinates(annotation, slideWidth, slideHeight);
    // Not a final message, but rendering it for the first time, creating a new path
    } else if (!this.path) {
      data = PencilDrawComponent.getInitialCoordinates(annotation, slideWidth, slideHeight);
    // If it's not the first 2 cases - means we just got an update, updating the coordinates
    } else {
      data = this.updateCoordinates(annotation, slideWidth, slideHeight);
    }

    this.points = data.points;
    return data.path;
  }

  getCurrentPath() {
    return this.path ? this.path : 'M -1 -1';
  }

  updateCoordinates(annotation, slideWidth, slideHeight) {
    const { points } = annotation;
    let i = this.points.length;
    let path = '';

    while (i < points.length) {
      path = `${path} L${(points[i] / 100) * slideWidth
      }, ${(points[i + 1] / 100) * slideHeight}`;
      i += 2;
    }
    path = this.path + path;

    return { path, points };
  }

  render() {
    const { annotation, slideWidth } = this.props;
    return (
      <path
        fill="none"
        stroke={AnnotationHelpers.getFormattedColor(annotation.color)}
        d={this.getCurrentPath()}
        strokeWidth={AnnotationHelpers.getStrokeWidth(annotation.thickness, slideWidth)}
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{ WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)' }}
      />
    );
  }
}

PencilDrawComponent.propTypes = {
  // Defines a version of the shape, so that we know if we need to update the component or not
  version: PropTypes.number.isRequired,
  // Defines an annotation object, which contains all the basic info we need to draw with a pencil
  annotation: PropTypes.shape({
    points: PropTypes.arrayOf(PropTypes.number).isRequired,
    color: PropTypes.number.isRequired,
    thickness: PropTypes.number.isRequired,
  }).isRequired,
  // Defines the width of the slide (svg coordinate system), which needed in calculations
  slideWidth: PropTypes.number.isRequired,
  // Defines the height of the slide (svg coordinate system), which needed in calculations
  slideHeight: PropTypes.number.isRequired,
};
