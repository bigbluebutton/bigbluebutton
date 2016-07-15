import React, { Component, PropTypes } from 'react';
import WhiteboardService from '/imports/ui/components/whiteboard/service.js';

const propTypes = {

  //Defines the cursor x position
  cx: PropTypes.number,

  //Defines the cursor y position
  cy: PropTypes.number,

  /**
   * Defines the cursor fill colour
   * @defaultValue 'red'
   */
  fill: PropTypes.string,

  /**
   * Defines the cursor radius
   * @defaultValue 5
   */
  radius: PropTypes.number,
};

const defaultProps = {
  fill: 'red',
  radius: 5,
};

export default class Cursor extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      viewBoxWidth,
      viewBoxHeight,
      viewBoxX,
      viewBoxY,
      widthRatio,
      cursorX,
      cursorY,
      fill,
      radius,
    } = this.props;

    //Adjust the x,y cursor position according to zoom
    let cx = (cursorX * viewBoxWidth) + viewBoxX;
    let cy = (cursorY * viewBoxHeight) + viewBoxY;

    //Adjust the radius of the cursor according to zoom
    let finalRadius = radius * widthRatio / 100;

    return (
      <circle
        cx={cx}
        cy={cy}
        r={finalRadius}
        fill={fill}
      />
    );
  }
}

Cursor.propTypes = propTypes;
Cursor.defaultProps = defaultProps;
