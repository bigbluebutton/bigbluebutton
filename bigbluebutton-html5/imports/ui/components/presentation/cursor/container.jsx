import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import CursorService from './service';
import Cursor from './component';

class CursorContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Cursor {...this.props}>
        {this.props.children}
      </Cursor>
    );
  }
}

export default createContainer(() => {
  let cursor = CursorService.getCurrentCursor();
  let cursorX = 0;
  let cursorY = 0;

  if(cursor) {
    cursorX = cursor.x;
    cursorY = cursor.y;
  }

  return {
    cursorX: cursorX,
    cursorY: cursorY,
  };
}, CursorContainer);

