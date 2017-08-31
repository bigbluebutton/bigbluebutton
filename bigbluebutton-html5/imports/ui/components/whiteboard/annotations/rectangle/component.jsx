import React from 'react';
import PropTypes from 'prop-types';
import AnnotationHelpers from '../helpers.js';

export default class RectangleDrawComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  getCoordinates() {
    // x1 and y1 are the coordinates of the top left corner of the annotation
    // x2 and y2 are the coordinates of the bottom right corner of the annotation
    let x1 = this.props.annotation.points[0];
    let y1 = this.props.annotation.points[1];
    let x2 = this.props.annotation.points[2];
    let y2 = this.props.annotation.points[3];

    // Presenter pulled rectangle to the left
    if (x2 < x1) {
      x1 = this.props.annotation.points[2];
      x2 = this.props.annotation.points[0];
    }

    // Presenter pulled Rectangle to the top
    if (y2 < y1) {
      y1 = this.props.annotation.points[3];
      y2 = this.props.annotation.points[1];
    }

    const x = x1 / 100 * this.props.slideWidth;
    const y = y1 / 100 * this.props.slideHeight;
    const width = (x2 - x1) / 100 * this.props.slideWidth;
    const height = (y2 - y1) / 100 * this.props.slideHeight;

    return {
      x,
      y,
      width,
      height,
    };
  }

  render() {
    const results = this.getCoordinates();
    return (
      <rect
        x={results.x}
        y={results.y}
        width={results.width}
        height={results.height}
        rx="1"
        ry="1"
        fill="none"
        stroke={AnnotationHelpers.formatColor(this.props.annotation.color)}
        strokeWidth={this.props.annotation.thickness}
        style={this.props.style}
      />
    );
  }
}

RectangleDrawComponent.defaultProps = {
  style: {
    WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
  },
};
