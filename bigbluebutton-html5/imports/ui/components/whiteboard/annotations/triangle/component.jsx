import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getFormattedColor, getStrokeWidth, denormalizeCoord } from '../helpers';

export default class TriangleDrawComponent extends Component {
  shouldComponentUpdate(nextProps) {
    const { version } = this.props;
    return version !== nextProps.version;
  }

  getCoordinates() {
    const { slideWidth, slideHeight, annotation } = this.props;
    const { points } = annotation;

    // points[0] and points[1] are x and y coordinates of the top left corner of the annotation
    // points[2] and points[3] are x and y coordinates of the bottom right corner of the annotation
    const xBottomLeft = points[0];
    const yBottomLeft = points[3];
    const xBottomRight = points[2];
    const yBottomRight = points[3];
    const xTop = ((xBottomRight - xBottomLeft) / 2) + xBottomLeft;
    const yTop = points[1];

    const path = `M${denormalizeCoord(xTop, slideWidth)
    },${denormalizeCoord(yTop, slideHeight)
    },${denormalizeCoord(xBottomLeft, slideWidth)
    },${denormalizeCoord(yBottomLeft, slideHeight)
    },${denormalizeCoord(xBottomRight, slideWidth)
    },${denormalizeCoord(yBottomRight, slideHeight)
    }Z`;

    return path;
  }

  render() {
    const path = this.getCoordinates();
    const { annotation, slideWidth } = this.props;
    return (
      <path
        style={{ WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)' }}
        fill="none"
        stroke={getFormattedColor(annotation.color)}
        d={path}
        strokeWidth={getStrokeWidth(annotation.thickness, slideWidth)}
        strokeLinejoin="miter"
      />
    );
  }
}

TriangleDrawComponent.propTypes = {
  // Defines a version of the shape, so that we know if we need to update the component or not
  version: PropTypes.number.isRequired,
  // Defines an annotation object, which contains all the basic info we need to draw a triangle
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
