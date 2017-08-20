import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.scss';
import AnnotationHelpers from '../helpers';

export default class PencilDrawComponent extends Component {

  shouldComponentUpdate(nextProps) {
    return this.props.version !== nextProps.version;
  }

  getCoordinates() {
    const { points } = this.props.annotation;
    const { slideWidth, slideHeight } = this.props;

    let i = 2;
    let path = '';
    if (points && points.length >= 2) {
      path = `${path}M${(points[0] / 100) * slideWidth
        }, ${(points[1] / 100) * slideHeight}`;
      while (i < points.length) {
        path = `${path} L${(points[i] / 100) * slideWidth
          }, ${(points[i + 1] / 100) * slideHeight}`;
        i += 2;
      }
    }
    return path;
  }

  render() {
    const path = this.getCoordinates();
    const { annotation, slideWidth } = this.props;
    return (
      <path
        className={styles.path}
        fill="none"
        stroke={AnnotationHelpers.formatColor(annotation.color)}
        d={path}
        strokeWidth={AnnotationHelpers.getStrokeWidth(annotation.thickness, slideWidth)}
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{ WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)' }}
      />
    );
  }
}

PencilDrawComponent.propTypes = {
  // Defines a version of the shape, so that we know if we need to update the component or not
  version: PropTypes.number.isRequired,
  // Defines an annotation object, which contains all the basic info we need to draw with a pencil
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
