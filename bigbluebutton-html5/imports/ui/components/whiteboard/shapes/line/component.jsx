import React, { PropTypes } from 'react';
import ShapeHelpers from '../helpers.js';

export default class LineDrawComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  getCoordinates() {
    let x1 = this.props.shape.points[0] / 100 * this.props.slideWidth;
    let y1 = this.props.shape.points[1] / 100 * this.props.slideHeight;
    let x2 = this.props.shape.points[2] / 100 * this.props.slideWidth;
    let y2 = this.props.shape.points[3] / 100 * this.props.slideHeight;

    return {
      x1: x1,
      y1: y1,
      x2: x2,
      y2: y2,
    };
  }

  render() {
    let results = this.getCoordinates();
    return (
      <line
        x1={results.x1}
        y1={results.y1}
        x2={results.x2}
        y2={results.y2}
        stroke={ShapeHelpers.formatColor(this.props.shape.color)}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={this.props.shape.thickness}
        style={this.props.style}
      />
    );
  }
}

LineDrawComponent.defaultProps = {
  style: {
    WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
  },
};
