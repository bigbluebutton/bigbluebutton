import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import ShapeGroupService from './service';
import ShapeGroup from './component';

const propTypes = {
  // the id is required to fetch the shapes
  whiteboardId: PropTypes.string.isRequired,

  // initial width and height of the slide are required to calculate the coordinates for each shape
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,

  //array of shapes, optional
  shapes: React.PropTypes.array,
};

class ShapeGroupContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ShapeGroup {...this.props} />
    );
  }
}

export default createContainer((params) => {
  const { whiteboardId, width, height } = params;
  const shapes = ShapeGroupService.getCurrentShapes(whiteboardId);
  const isPresenter = ShapeGroupService.isPresenter();

  return {
    shapes,
    width,
    height,
    isPresenter,
  };
}, ShapeGroupContainer);

ShapeGroupContainer.propTypes = propTypes;
