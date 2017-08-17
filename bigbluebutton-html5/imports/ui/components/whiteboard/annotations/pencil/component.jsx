import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.scss';
import AnnotationHelpers from '../helpers.js';

export default class PencilDrawComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.version != nextProps.version;
  }

  getCoordinates() {
    let i = 2;
    let path = '';
    const points = this.props.annotation.points;
    if (points && points.length >= 2) {
      path = `${path}M${points[0] / 100 * this.props.slideWidth
        }, ${points[1] / 100 * this.props.slideHeight}`;
      while (i < points.length) {
        path = `${path} L${points[i] / 100 * this.props.slideWidth
          }, ${points[i + 1] / 100 * this.props.slideHeight}`;
        i += 2;
      }

      return path;
    }
  }

  render() {
    const path = this.getCoordinates();
    return (
      <path
        className={styles.path}
        fill="none"
        stroke={AnnotationHelpers.formatColor(this.props.annotation.color)}
        d={path}
        strokeWidth={AnnotationHelpers.getStrokeWidth(this.props.annotation.thickness, this.props.slideWidth)}
        strokeLinejoin="round"
        strokeLinecap="round"
        style={this.props.style}
      />
    );
  }
}

PencilDrawComponent.defaultProps = {
  style: {
    WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
  },
};
