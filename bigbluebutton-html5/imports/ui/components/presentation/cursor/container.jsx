import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import CursorService from './service';
import Cursor from './component';


class CursorContainer extends Component {
  constructor() {
    super();
    this.state = {
      labelBoxWidth: 0,
      labelBoxHeight: 0,
    };
    this.setLabelBoxDimensions = this.setLabelBoxDimensions.bind(this);
  }

  setLabelBoxDimensions(labelBoxWidth, labelBoxHeight) {
    this.setState({
      labelBoxWidth,
      labelBoxHeight,
    });
  }

  render() {
    const { cursorX, cursorY } = this.props;

    if (cursorX > 0 && cursorY > 0) {
      return (
        <Cursor
          cursorX={cursorX}
          cursorY={cursorY}
          labelBoxWidth={this.state.labelBoxWidth}
          labelBoxHeight={this.state.labelBoxHeight}
          setLabelBoxDimensions={this.setLabelBoxDimensions}
          {...this.props}
        />
      );
    }
    return null;
  }

}


export default createContainer((params) => {
  const { cursorId } = params;

  const cursor = CursorService.getCurrentCursor(cursorId);
  let cursorX = -1;
  let cursorY = -1;
  let userName = '';

  if (cursor) {
    cursorX = cursor.x;
    cursorY = cursor.y;
    userName = cursor.userName;
  }

  return {
    cursorX,
    cursorY,
    userName,
  };
}, CursorContainer);


CursorContainer.propTypes = {
  // Defines the 'x' coordinate for the cursor, in percentages of the slide's width
  cursorX: PropTypes.number.isRequired,

  // Defines the 'y' coordinate for the cursor, in percentages of the slide's height
  cursorY: PropTypes.number.isRequired,
};
