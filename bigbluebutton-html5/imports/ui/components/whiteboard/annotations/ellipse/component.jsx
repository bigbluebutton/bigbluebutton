import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getFormattedColor, getStrokeWidth, denormalizeCoord } from '../helpers';

export default class EllipseDrawComponent extends Component {
  shouldComponentUpdate(nextProps) {
    const { version, hidden, selected } = this.props;
    return version !== nextProps.version || hidden !== nextProps.hidden || selected !== nextProps.selected;
  }

  getCoordinates() {
    const { slideWidth, slideHeight, annotation } = this.props;
    const { points } = annotation;

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
    const cx = denormalizeCoord(rx + x1, slideWidth);
    const cy = denormalizeCoord(ry + y1, slideHeight);
    rx = denormalizeCoord(Math.abs(rx), slideWidth);
    ry = denormalizeCoord(Math.abs(ry), slideHeight);

    return {
      cx,
      cy,
      rx,
      ry,
    };
  }

  getBBox() {
    const { slideWidth, slideHeight, annotation } = this.props;
    const { points } = annotation;

    const x = denormalizeCoord(Math.min(points[0], points[2]), slideWidth)
    const y = denormalizeCoord(Math.min(points[1], points[3]), slideHeight)
    const width = denormalizeCoord(Math.max(points[0], points[2]), slideWidth) - x;
    const height = denormalizeCoord(Math.max(points[1], points[3]), slideHeight) -y;

    return {x, y, width, height};
  }

  render() {
    const results = this.getCoordinates();
    const { annotation, slideWidth, hidden, selected, isEditable } = this.props;
    const { fill } = annotation;
    const {
      cx, cy, rx, ry,
    } = results;

    const bbox  = this.getBBox();
    return (
     <g>
     {hidden ? null :
      <ellipse
        id={annotation.id}
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill={ fill ? getFormattedColor(annotation.color) : "none" }
        stroke={getFormattedColor(annotation.color)}
        strokeWidth={getStrokeWidth(annotation.thickness, slideWidth)}
        style={{ WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)' }}
        data-test="drawnEllipse"
      />}
     {selected &&
      <rect
        x={bbox.x}
        y={bbox.y}
        width={bbox.width}
        height={bbox.height}
        fill= "none"
        stroke={isEditable ? Meteor.settings.public.whiteboard.selectColor : Meteor.settings.public.whiteboard.selectInertColor}
        opacity="0.5"
        strokeWidth={getStrokeWidth(annotation.thickness+1, slideWidth)}
        style={{ WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)' }}
        data-test="drawnEllipseSelection"
      />}
     </g>      
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
    fill: PropTypes.bool.isRequired,
  }).isRequired,
  // Defines the width of the slide (svg coordinate system), which needed in calculations
  slideWidth: PropTypes.number.isRequired,
  // Defines the height of the slide (svg coordinate system), which needed in calculations
  slideHeight: PropTypes.number.isRequired,
};
