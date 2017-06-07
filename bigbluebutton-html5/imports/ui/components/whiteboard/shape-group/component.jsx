import React, { Component, PropTypes } from 'react';
import Ellipse from '../shapes/ellipse/component.jsx';
import Line from '../shapes/line/component.jsx';
import Poll from '../shapes/poll/component.jsx';
import Rectangle from '../shapes/rectangle/component.jsx';
import Text from '../shapes/text/component.jsx';
import Triangle from '../shapes/triangle/component.jsx';
import Pencil from '../shapes/pencil/component.jsx';


const propTypes = {
  // initial width and height of the slide are required to calculate the coordinates for each shape
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,

  //array of shapes, optional
  shapes: React.PropTypes.array,
};

export default class ShapeGroup extends React.Component {
  constructor(props) {
    super(props);
    this.renderShape = this.renderShape.bind(this);
  }

  renderShape(shape, width, height) {
    let Component = this.props.shapeSelector[shape.shape.type];
    let additionalProps = shape.shape.type == "text" ? { isPresenter: this.props.isPresenter } : null;

    if (Component != null) {
      return (
        <Component
          key={shape.id}
          shape={shape.shape}
          slideWidth={width}
          slideHeight={height}
          {...additionalProps}
        />
      );
    } else {
      console.error('Unexpected shape type received: ' + shape.shape.type);
      return (
        <g key={shape.shape.id}></g>
      );
    }
  }

  render() {
    const {
      shapes,
      width,
      height,
    } = this.props;

    return (
      <g>
        {shapes ? shapes.map((shape) =>
            this.renderShape(shape.shape, width, height)
          )
        : null }
      </g>
    );
  }
}

ShapeGroup.propTypes = propTypes;


ShapeGroup.defaultProps = {
  shapeSelector: {
    ellipse: Ellipse,
    line: Line,
    poll_result: Poll,
    rectangle: Rectangle,
    text: Text,
    triangle: Triangle,
    pencil: Pencil,
  },
};
