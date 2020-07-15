import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
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
    const { labelBoxWidth, labelBoxHeight } = this.state;

    if (cursorX > 0 && cursorY > 0) {
      return (
        <Cursor
          cursorX={cursorX}
          cursorY={cursorY}
          labelBoxWidth={labelBoxWidth}
          labelBoxHeight={labelBoxHeight}
          setLabelBoxDimensions={this.setLabelBoxDimensions}
          {...this.props}
        />
      );
    }
    return null;
  }
}


export default withTracker((params) => {
  const { cursorId } = params;

  const cursor = CursorService.getCurrentCursor(cursorId);

  if (cursor) {
    const { xPercent: cursorX, yPercent: cursorY, userName } = cursor;
    const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
    return {
      cursorX,
      cursorY,
      userName,
      isRTL,
    };
  }

  return {
    cursorX: -1,
    cursorY: -1,
    userName: '',
  };
})(CursorContainer);


CursorContainer.propTypes = {
  // Defines the 'x' coordinate for the cursor, in percentages of the slide's width
  cursorX: PropTypes.number.isRequired,

  // Defines the 'y' coordinate for the cursor, in percentages of the slide's height
  cursorY: PropTypes.number.isRequired,
};
