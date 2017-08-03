import React from 'react';
import PropTypes from 'prop-types';
import Ellipse from '../annotations/ellipse/component.jsx';
import Line from '../annotations/line/component.jsx';
import Poll from '../annotations/poll/component.jsx';
import Rectangle from '../annotations/rectangle/component.jsx';
import Text from '../annotations/text/component.jsx';
import Triangle from '../annotations/triangle/component.jsx';
import Pencil from '../annotations/pencil/component.jsx';

export default class WhiteboardAnnotationModel extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const Component = this.props.annotations[this.props.annotation.annotationType];
    if (Component != null) {
      return (
        <Component
          annotation={this.props.annotation.annotationInfo}
          widthRatio={this.props.widthRatio}
          heightRatio={this.props.heightRatio}
          slideWidth={this.props.slideWidth}
          slideHeight={this.props.slideHeight}
        />
      );
    }
    return (
      <g />
    );
  }
}

WhiteboardAnnotationModel.defaultProps = {
  annotations: {
    ellipse: Ellipse,
    line: Line,
    poll_result: Poll,
    rectangle: Rectangle,
    text: Text,
    triangle: Triangle,
    pencil: Pencil,
  },
};
