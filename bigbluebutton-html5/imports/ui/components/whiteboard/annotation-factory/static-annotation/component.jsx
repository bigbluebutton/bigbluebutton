import React from 'react';
import PropTypes from 'prop-types';
import StaticAnnotationService from './service';

export default class StaticAnnotation extends React.Component {
  // completed annotations can be updated for synchronized drawing
  shouldComponentUpdate(nextProps) {
    const { version } = this.props;
    return version !== nextProps.version;
  }

  render() {
    const annotation = StaticAnnotationService.getAnnotationById(this.props.shapeId);
    const Component = this.props.drawObject;

    return (
      <Component
        version={annotation.version}
        annotation={annotation.annotationInfo}
        slideWidth={this.props.slideWidth}
        slideHeight={this.props.slideHeight}
        whiteboardId={this.props.whiteboardId}
      />
    );
  }
}

StaticAnnotation.propTypes = {
  whiteboardId: PropTypes.string.isRequired,
  shapeId: PropTypes.string.isRequired,
  drawObject: PropTypes.func.isRequired,
  slideWidth: PropTypes.number.isRequired,
  slideHeight: PropTypes.number.isRequired,
};
