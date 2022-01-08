import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getFormattedColor, getStrokeWidth, denormalizeCoord } from '../helpers';

export default class LineDrawComponent extends Component {
  shouldComponentUpdate(nextProps) {
    const { version, hidden, selected } = this.props;
    return version !== nextProps.version || hidden !== nextProps.hidden  || selected !== nextProps.selected;
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
    const { annotation, slideWidth, hidden, selected, isEditable } = this.props;
    const {
      x1, y1, x2, y2,
    } = results;

    return (
     <g>
     {hidden ? null :
      <line
        id={annotation.id}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={getFormattedColor(annotation.color)}
        strokeLinejoin="round"
        strokeWidth={getStrokeWidth(annotation.thickness, slideWidth)}
        style={{ WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)' }}
        data-test="drawnLine"
      />}
     {selected &&
      <rect
        x={Math.min(x1,x2)}
        y={Math.min(y1,y2)}
        width={Math.abs(x1-x2)}
        height={Math.abs(y1-y2)}
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
