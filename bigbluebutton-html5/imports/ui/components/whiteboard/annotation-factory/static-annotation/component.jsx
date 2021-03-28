import React from 'react';
import PropTypes from 'prop-types';
import StaticAnnotationService from './service';

export default class StaticAnnotation extends React.Component {
  shouldComponentUpdate(nextProps) {
    const { hidden } = this.props;
    return hidden !== nextProps.hidden;
  }

  render() {
    const {
      hidden,
    } = this.props;
    const annotation = StaticAnnotationService.getAnnotationById(this.props.shapeId);
    const Component = this.props.drawObject;

    return (
      <Component
        version={annotation.version}
        annotation={annotation.annotationInfo}
        slideWidth={this.props.slideWidth}
        slideHeight={this.props.slideHeight}
        whiteboardId={this.props.whiteboardId}
        hidden={hidden}
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
