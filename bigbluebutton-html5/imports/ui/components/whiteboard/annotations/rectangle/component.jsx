import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getFormattedColor, getStrokeWidth, denormalizeCoord } from '../helpers';

export default class RectangleDrawComponent extends Component {
  shouldComponentUpdate(nextProps) {
    const { version } = this.props;
    return version !== nextProps.version;
  }

  getCoordinates() {
    const { slideWidth, slideHeight, annotation } = this.props;
    const { points } = annotation;
    /* eslint-disable prefer-destructuring */
    // x1 and y1 are the coordinates of the top left corner of the annotation
    // x2 and y2 are the coordinates of the bottom right corner of the annotation
    let x1 = points[0];
    let y1 = points[1];
    let x2 = points[2];
    let y2 = points[3];

    // Presenter pulled rectangle to the left
    if (x2 < x1) {
      x1 = points[2];
      x2 = points[0];
    }

    // Presenter pulled Rectangle to the top
    if (y2 < y1) {
      y1 = points[3];
      y2 = points[1];
    }
    /* eslint-enable prefer-destructuring */
    const x = denormalizeCoord(x1, slideWidth);
    const y = denormalizeCoord(y1, slideHeight);
    const width = denormalizeCoord((x2 - x1), slideWidth);
    const height = denormalizeCoord((y2 - y1), slideHeight);

    return {
      x,
      y,
      width,
      height,
    };
  }

  render() {
    const results = this.getCoordinates();
    const { annotation, slideWidth } = this.props;
    const { fill } = annotation;

    return (
      <rect
        x={results.x}
        y={results.y}
        width={results.width}
        height={results.height}
        fill={ fill ? getFormattedColor(annotation.color) : "none" }
        stroke={getFormattedColor(annotation.color)}
        strokeWidth={getStrokeWidth(annotation.thickness, slideWidth)}
        style={{ WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)' }}
        data-test="drawnRectangle"
      />
    );
  }
}

RectangleDrawComponent.propTypes = {
  // Defines a version of the shape, so that we know if we need to update the component or not
  version: PropTypes.number.isRequired,
  // Defines an annotation object, which contains all the basic info we need to draw a rectangle
  annotation: PropTypes.shape({
    points: PropTypes.arrayOf(PropTypes.number).isRequired,
    color: PropTypes.number.isRequired,
    thickness: PropTypes.number.isRequired,
    fill: PropTypes.bool.isRequired,
  }).isRequired,
  // Defines the width of the slide (svg coordinate system), which needed in calculations
  slideWidth: PropTypes.number.isRequired,
  // Defines the height of the slide (svg coordinate system), which needed in calculations
  slideHeight: PropTypes.number.isRequired,
};
