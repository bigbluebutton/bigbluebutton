import React, { PropTypes } from 'react';
import Ellipse from '../shapes/ellipse/component.jsx';
import Line from '../shapes/line/component.jsx';
import Poll from '../shapes/poll/component.jsx';
import Rectangle from '../shapes/rectangle/component.jsx';
import Text from '../shapes/text/component.jsx';
import Triangle from '../shapes/triangle/component.jsx';
import Pencil from '../shapes/pencil/component.jsx';

export default class WhiteboardShapeModel extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let Component = this.props.shapes[this.props.shape.shape_type];
    if (Component != null) {
      return (
        <Component
          shape={this.props.shape.shape}
          widthRatio={this.props.widthRatio}
          heightRatio={this.props.heightRatio}
          slideWidth={this.props.slideWidth}
          slideHeight={this.props.slideHeight}
        />
      );
    } else {
      return (
        <g></g>
      );
    }
  }
}

WhiteboardShapeModel.defaultProps = {
  shapes: {
    ellipse: Ellipse,
    line: Line,
    poll_result: Poll,
    rectangle: Rectangle,
    text: Text,
    triangle: Triangle,
    pencil: Pencil,
  },
};
