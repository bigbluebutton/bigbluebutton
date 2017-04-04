import React, { Component, PropTypes } from 'react';
import WhiteboardShapeModel from '../shape-factory/component';

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
          <WhiteboardShapeModel
            shape={shape.shape}
            key={shape.shape.id}
            slideWidth = {width}
            slideHeight = {height}
          />
          )
        : null }
      </g>
    );
  }
}

ShapeGroup.propTypes = propTypes;
