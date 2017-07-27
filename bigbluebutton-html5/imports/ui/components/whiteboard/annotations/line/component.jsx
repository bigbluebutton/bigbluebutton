import React from 'react';
import PropTypes from 'prop-types';
import AnnotationHelpers from '../helpers.js';

export default class LineDrawComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  getCoordinates() {
    const x1 = this.props.annotation.points[0] / 100 * this.props.slideWidth;
    const y1 = this.props.annotation.points[1] / 100 * this.props.slideHeight;
    const x2 = this.props.annotation.points[2] / 100 * this.props.slideWidth;
    const y2 = this.props.annotation.points[3] / 100 * this.props.slideHeight;

    return {
      x1,
      y1,
      x2,
      y2,
    };
  }

  render() {
    const results = this.getCoordinates();
    return (
      <line
        x1={results.x1}
        y1={results.y1}
        x2={results.x2}
        y2={results.y2}
        stroke={AnnotationHelpers.formatColor(this.props.annotation.color)}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={this.props.annotation.thickness}
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
