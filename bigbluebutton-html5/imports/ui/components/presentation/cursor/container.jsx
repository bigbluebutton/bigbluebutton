import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import CursorService from './service';
import Cursor from './component';


const CursorContainer = ({ cursorX, cursorY, ...rest }) => {
  if (cursorX > 0 && cursorY > 0) {
    return (
      <Cursor
        cursorX={cursorX}
        cursorY={cursorY}
        {...rest}
      />
    );
  }
  return null;
};


export default createContainer(() => {
  const cursor = CursorService.getCurrentCursor();

  let cursorX = -1;
  let cursorY = -1;

  if (cursor) {
    cursorX = cursor.x;
    cursorY = cursor.y;
  }

  return {
    cursorX,
    cursorY,
  };
}, CursorContainer);


CursorContainer.propTypes = {
  // Defines the 'x' coordinate for the cursor, in percentages of the slide's width
  cursorX: PropTypes.number.isRequired,

  // Defines the 'y' coordinate for the cursor, in percentages of the slide's height
  cursorY: PropTypes.number.isRequired,
};
