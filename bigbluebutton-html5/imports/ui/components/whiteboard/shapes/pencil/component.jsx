import React, { PropTypes } from 'react';
import ShapeHelpers from '../helpers.js';

export default class PencilDrawComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  getCoordinates() {
    let i = 2;
    let path = '';
    let points = this.props.shape.points;
    if (points && points.length >= 2) {
      path = path + 'M' + (points[0] / 100 * this.props.slideWidth) +
        ', ' + (points[1] / 100 * this.props.slideHeight);
      while (i < points.length) {
        path = path + ' L' + (points[i] / 100 * this.props.slideWidth) +
          ', ' + (points[i + 1] / 100 * this.props.slideHeight);
        i += 2;
      }

      return path;
    }
  }

  render() {
    let path = this.getCoordinates();
    return (
      <path
        fill="none"
        stroke={ShapeHelpers.formatColor(this.props.shape.color)}
        d={path}
        strokeWidth={this.props.shape.thickness}
        strokeLinejoin="round"
        strokeLinecap="round"
        style={this.props.style}>
      </path>
    );
  }
}

PencilDrawComponent.defaultProps = {
  style: {
    WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
  },
};
