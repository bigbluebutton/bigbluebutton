import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getFormattedColor, getStrokeWidth, denormalizeCoord } from '../helpers';
import BenzeneService from '../commonservice';

export default class BenzeneDrawComponent extends Component {
  shouldComponentUpdate(nextProps) {
    const { version } = this.props;
    return version !== nextProps.version;
  }

  getCoordinates() {
    const { slideWidth, slideHeight, annotation } = this.props;
    const { points } = annotation;

    // points[0] and points[1] are x and y coordinates of the top left corner of the annotation
    // points[2] and points[3] are x and y coordinates of the bottom right corner of the annotation
    const denormalizeCoordFloat = (normCoord, sideLength) => ((normCoord / 100) * sideLength);
    const x0 = denormalizeCoordFloat(points[0], slideWidth);
    const y0 = denormalizeCoordFloat(points[1], slideHeight);
    const x3 = denormalizeCoordFloat(points[2], slideWidth);
    const y3 = denormalizeCoordFloat(points[3], slideHeight);
    const xC = ( x0 + x3 ) / 2;
    const yC = ( y0 + y3 ) / 2;
    const x1 = Math.cos(Math.PI / 3    ) * (x0 - xC) - Math.sin(Math.PI / 3    ) * (y0 - yC) + xC;
    const y1 = Math.sin(Math.PI / 3    ) * (x0 - xC) + Math.cos(Math.PI / 3    ) * (y0 - yC) + yC;
    const x2 = Math.cos(Math.PI / 3 * 2) * (x0 - xC) - Math.sin(Math.PI / 3 * 2) * (y0 - yC) + xC;
    const y2 = Math.sin(Math.PI / 3 * 2) * (x0 - xC) + Math.cos(Math.PI / 3 * 2) * (y0 - yC) + yC;
    const x4 = Math.cos(Math.PI / 3 * 4) * (x0 - xC) - Math.sin(Math.PI / 3 * 4) * (y0 - yC) + xC;
    const y4 = Math.sin(Math.PI / 3 * 4) * (x0 - xC) + Math.cos(Math.PI / 3 * 4) * (y0 - yC) + yC;
    const x5 = Math.cos(Math.PI / 3 * 5) * (x0 - xC) - Math.sin(Math.PI / 3 * 5) * (y0 - yC) + xC;
    const y5 = Math.sin(Math.PI / 3 * 5) * (x0 - xC) + Math.cos(Math.PI / 3 * 5) * (y0 - yC) + yC;
    const xp0 = (x0 * 3 + xC) / 4;
    const yp0 = (y0 * 3 + yC) / 4;
    const xp1 = (x1 * 3 + xC) / 4;
    const yp1 = (y1 * 3 + yC) / 4;
    const xp2 = (x2 * 3 + xC) / 4;
    const yp2 = (y2 * 3 + yC) / 4;
    const xp3 = (x3 * 3 + xC) / 4;
    const yp3 = (y3 * 3 + yC) / 4;
    const xp4 = (x4 * 3 + xC) / 4;
    const yp4 = (y4 * 3 + yC) / 4;
    const xp5 = (x5 * 3 + xC) / 4;
    const yp5 = (y5 * 3 + yC) / 4;

    const path = `M${x0.toFixed(2)
                 },${y0.toFixed(2)
                 },${x1.toFixed(2)
                 },${y1.toFixed(2)
                 },${x2.toFixed(2)
                 },${y2.toFixed(2)
                 },${x3.toFixed(2)
                 },${y3.toFixed(2)
                 },${x4.toFixed(2)
                 },${y4.toFixed(2)
                 },${x5.toFixed(2)
                 },${y5.toFixed(2)
                 }Z
                  M${xp0.toFixed(2)
                 },${yp0.toFixed(2)
                 },${xp1.toFixed(2)
                 },${yp1.toFixed(2)
                 }M${xp2.toFixed(2)
                 },${yp2.toFixed(2)
                 },${xp3.toFixed(2)
                 },${yp3.toFixed(2)
                 }M${xp4.toFixed(2)
                 },${yp4.toFixed(2)
                 },${xp5.toFixed(2)
                 },${yp5.toFixed(2)
                 }`;

    return path;
  }

  render() {
    const path = this.getCoordinates();
    const { annotation, slideWidth, whiteboardId, currentMultiUser } = this.props;
    //const { fill } = annotation;
    const isPresenter = BenzeneService.isPresenter();
    const currentUserID = BenzeneService.currentUserID();
    const drawerID = annotation.id.replace(/-.*$/,'');
    const isDrawerPresenter = BenzeneService.isHePresenter(drawerID);

    return (
      currentMultiUser == 2 && !isPresenter && !isDrawerPresenter && currentUserID != drawerID ? null :
      <path
        style={{ WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)' }}
        fill="none"
        stroke={getFormattedColor(annotation.color)}
        d={path}
        strokeWidth={getStrokeWidth(annotation.thickness, slideWidth)}
        strokeLinejoin="miter"
        data-test="drawnBenzene"
      />
    );
  }
}

BenzeneDrawComponent.propTypes = {
  // Defines a version of the shape, so that we know if we need to update the component or not
  version: PropTypes.number.isRequired,
  // Defines an annotation object, which contains all the basic info we need to draw a benzene ring
  annotation: PropTypes.shape({
    points: PropTypes.arrayOf(PropTypes.number).isRequired,
    color: PropTypes.number.isRequired,
    thickness: PropTypes.number.isRequired,
    //fill: PropTypes.bool.isRequired,
  }).isRequired,
  // Defines the width of the slide (svg coordinate system), which needed in calculations
  slideWidth: PropTypes.number.isRequired,
  // Defines the height of the slide (svg coordinate system), which needed in calculations
  slideHeight: PropTypes.number.isRequired,
};
