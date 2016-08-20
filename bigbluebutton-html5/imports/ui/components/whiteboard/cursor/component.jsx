import React, { Component, PropTypes } from 'react';
import WhiteboardService from '/imports/ui/components/whiteboard/service.js';

const propTypes = {
  //Width of the view box
  viewBoxWidth: PropTypes.number.isRequired,

  //Height of the view box
  viewBoxHeight: PropTypes.number.isRequired,

  //x Position of the view box
  viewBoxX: PropTypes.number.isRequired,

  //y Position of the view box
  viewBoxY: PropTypes.number.isRequired,

  //Slide to view box width ratio
  widthRatio: PropTypes.number.isRequired,

  //Defines the cursor x position
  cursorX: PropTypes.number.isRequired,

  //Defines the cursor y position
  cursorY: PropTypes.number.isRequired,

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
