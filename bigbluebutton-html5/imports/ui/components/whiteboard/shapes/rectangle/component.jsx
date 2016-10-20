import React, { PropTypes } from 'react';
import ShapeHelpers from '../helpers.js';

export default class RectangleDrawComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  getCoordinates() {
    //x1 and y1 are the coordinates of the top left corner of the shape
    //x2 and y2 are the coordinates of the bottom right corner of the shape
    let x1 = this.props.shape.points[0];
    let y1 = this.props.shape.points[1];
    let x2 = this.props.shape.points[2];
    let y2 = this.props.shape.points[3];

    //Presenter pulled rectangle to the left
    if (x2 < x1) {
      x1 = this.props.shape.points[2];
      x2 = this.props.shape.points[0];
    }

    //Presenter pulled Rectangle to the top
    if (y2 < y1) {
      y1 = this.props.shape.points[3];
      y2 = this.props.shape.points[1];
    }

    let x = x1 / 100 * this.props.slideWidth;
    let y = y1 / 100 * this.props.slideHeight;
    let width = (x2 - x1) / 100 * this.props.slideWidth;
    let height = (y2 - y1) / 100 * this.props.slideHeight;

    return {
      x: x,
      y: y,
      width: width,
      height: height,
    };
  }

  render() {
    let results = this.getCoordinates();
    return (
      <rect
        x={results.x}
        y={results.y}
        width={results.width}
        height={results.height}
        rx="1"
        ry="1"
        fill="none"
        stroke={ShapeHelpers.formatColor(this.props.shape.color)}
        strokeWidth={this.props.shape.thickness}
        style={this.props.style}
      >
      </rect>
    );
  }
}

RectangleDrawComponent.defaultProps = {
  style: {
    WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
  },
};
