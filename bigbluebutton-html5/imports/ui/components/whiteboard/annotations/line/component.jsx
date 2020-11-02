import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getFormattedColor, getStrokeWidth, denormalizeCoord } from '../helpers';

export default class LineDrawComponent extends Component {
  shouldComponentUpdate(nextProps) {
    const { version } = this.props;
    return version !== nextProps.version;
  }

  getCoordinates() {
    const { slideWidth, slideHeight, annotation } = this.props;
    const { points } = annotation;

    const x1 = denormalizeCoord(points[0], slideWidth);
    const y1 = denormalizeCoord(points[1], slideHeight);
    const x2 = denormalizeCoord(points[2], slideWidth);
    const y2 = denormalizeCoord(points[3], slideHeight);

    return {
      x1,
      y1,
      x2,
      y2,
    };
  }

  render() {
    const results = this.getCoordinates();
    const { annotation, slideWidth } = this.props;
    const {
      x1, y1, x2, y2,
    } = results;

    return (
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={getFormattedColor(annotation.color)}
        strokeLinejoin="round"
        strokeWidth={getStrokeWidth(annotation.thickness, slideWidth)}
        style={{ WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)' }}
        data-test="drawnLine"
      />
    );
  }
}

LineDrawComponent.propTypes = {
  // Defines a version of the shape, so that we know if we need to update the component or not
  version: PropTypes.number.isRequired,
  // Defines an annotation object, which contains all the basic info we need to draw a line
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
