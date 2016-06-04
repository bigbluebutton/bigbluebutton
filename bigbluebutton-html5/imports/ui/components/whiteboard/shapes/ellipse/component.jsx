import React, { PropTypes } from 'react';
import ShapeHelpers from '../helpers.js';

export default class EllipseDrawComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  getCoordinates() {
    //rx - horizontal radius
    //ry - vertical radius
    //cx and cy - coordinates of the ellipse's center
    let rx;
    let ry;
    let cx;
    let cy;

    //x1 and y1 - coordinates of the ellipse's top left corner
    //x2 and y2 - coordinates of the ellipse's bottom right corner
    const x1 = this.props.shape.points[0];
    const y1 = this.props.shape.points[1];
    const x2 = this.props.shape.points[2];
    const y2 = this.props.shape.points[3];

    rx = (x2 - x1) / 2;
    ry = (y2 - y1) / 2;
    cx = (rx + x1) * this.props.slideWidth / 100;
    cy = (ry + y1) * this.props.slideHeight / 100;
    rx = Math.abs(rx / 100 * this.props.slideWidth);
    ry = Math.abs(ry / 100 * this.props.slideHeight);

    return {
      cx: cx,
      cy: cy,
      rx: rx,
      ry: ry,
    };
  }

  render() {
    let results = this.getCoordinates();
    return (
      <ellipse
        cx={results.cx}
        cy={results.cy}
        rx={results.rx}
        ry={results.ry}
        fill="none"
        stroke={ShapeHelpers.formatColor(this.props.shape.color)}
        strokeWidth={
          ShapeHelpers.getStrokeWidth(
            this.props.shape.thickness,
            this.props.widthRatio,
            this.props.heightRatio
          )
        }
        style={this.props.style}
      >
      </ellipse>
    );
  }
}

EllipseDrawComponent.defaultProps = {
  style: {
    WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
  },
};
