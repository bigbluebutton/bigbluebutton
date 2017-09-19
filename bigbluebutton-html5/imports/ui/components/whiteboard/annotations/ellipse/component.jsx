import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AnnotationHelpers from '../helpers';

export default class EllipseDrawComponent extends Component {

  shouldComponentUpdate(nextProps) {
    return this.props.version !== nextProps.version;
  }

  getCoordinates() {
    const { points } = this.props.annotation;
    const { slideWidth, slideHeight } = this.props;

    // x1 and y1 - coordinates of the ellipse's top left corner
    // x2 and y2 - coordinates of the ellipse's bottom right corner
    const x1 = points[0];
    const y1 = points[1];
    const x2 = points[2];
    const y2 = points[3];

    // rx - horizontal radius
    // ry - vertical radius
    // cx and cy - coordinates of the ellipse's center
    let rx = (x2 - x1) / 2;
    let ry = (y2 - y1) / 2;
    const cx = ((rx + x1) * slideWidth) / 100;
    const cy = ((ry + y1) * slideHeight) / 100;
    rx = Math.abs((rx / 100) * slideWidth);
    ry = Math.abs((ry / 100) * slideHeight);

    return {
      cx,
      cy,
      rx,
      ry,
    };
  }

  render() {
    const results = this.getCoordinates();
    const { annotation, slideWidth } = this.props;
    const { cx, cy, rx, ry } = results;

    return (
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill="none"
        stroke={AnnotationHelpers.getFormattedColor(annotation.color)}
        strokeWidth={AnnotationHelpers.getStrokeWidth(annotation.thickness, slideWidth)}
        style={{ WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)' }}
      />
    );
  }
}

EllipseDrawComponent.propTypes = {
  // Defines a version of the shape, so that we know if we need to update the component or not
  version: PropTypes.number.isRequired,
  // Defines an annotation object, which contains all the basic info we need to draw an ellipse
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
