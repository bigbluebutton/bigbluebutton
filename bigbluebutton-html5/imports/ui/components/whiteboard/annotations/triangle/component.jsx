import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getFormattedColor, getStrokeWidth, denormalizeCoord } from '../helpers';

export default class TriangleDrawComponent extends Component {
  shouldComponentUpdate(nextProps) {
    const { version, hidden, selected } = this.props;
    return version !== nextProps.version || hidden !== nextProps.hidden || selected !== nextProps.selected;
  }

  getCoordinates() {
    const { slideWidth, slideHeight, annotation } = this.props;
    const { points } = annotation;

    const xApex = ((points[2] - points[0]) / 2) + points[0];
    const yApex = points[1];

    const path = `M${denormalizeCoord(xApex, slideWidth)
    },${denormalizeCoord(yApex, slideHeight)
    },${denormalizeCoord(points[0], slideWidth)
    },${denormalizeCoord(points[3], slideHeight)
    },${denormalizeCoord(points[2], slideWidth)
    },${denormalizeCoord(points[3], slideHeight)
    }Z`;
    
    return path;
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
    const path = this.getCoordinates();
    const { annotation, slideWidth, hidden, selected, isEditable } = this.props;
    const { fill } = annotation;
    const bbox = selected ? this.getBBox() : {x:0, y:0, width:0, height:0};
    return (
     <g>
     {hidden ? null :
      <path
        id={annotation.id}
        style={{ WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)' }}
        fill={ fill ? getFormattedColor(annotation.color) : "none" }
        stroke={getFormattedColor(annotation.color)}
        d={path}
        strokeWidth={getStrokeWidth(annotation.thickness, slideWidth)}
        strokeLinejoin="miter"
        data-test="drawnTriangle"
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
        data-test="drawnTriangleSelection"
      />}
     </g>
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
    fill: PropTypes.bool.isRequired,
  }).isRequired,
  // Defines the width of the slide (svg coordinate system), which needed in calculations
  slideWidth: PropTypes.number.isRequired,
  // Defines the height of the slide (svg coordinate system), which needed in calculations
  slideHeight: PropTypes.number.isRequired,
};
