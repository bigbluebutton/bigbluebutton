import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class PresentationOverlay extends Component {
  constructor(props) {
    super(props);

    // last sent coordinates
    this.lastSentOffsetX = 0;
    this.lastSentOffsetY = 0;

    // last updated coordinates
    this.currentOffsetX = 0;
    this.currentOffsetY = 0;

    // id of the setInterval()
    this.intervalId = 0;

    this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
    this.checkCursor = this.checkCursor.bind(this);
    this.mouseEnterHandler = this.mouseEnterHandler.bind(this);
    this.mouseOutHandler = this.mouseOutHandler.bind(this);
  }

  mouseMoveHandler(event) {
    // for the case where you change settings in one of the lists (which are displayed on the slide)
    // the mouse starts pointing to the slide right away and mouseEnter doesn't fire
    // so we call it manually here
    if (!this.intervalId) {
      this.mouseEnterHandler();
    }

    this.currentOffsetX = event.nativeEvent.offsetX;
    this.currentOffsetY = event.nativeEvent.offsetY;
  }

  checkCursor() {
    // check if the cursor hasn't moved since last check
    if (this.lastSentOffsetX !== this.currentOffsetX
      || this.lastSentOffsetY !== this.currentOffsetY) {
      // determining the cursor's coordinates as percentages from the slide's width/height
      const xPercent = (this.currentOffsetX / this.props.slideWidth) * 100;
      const yPercent = (this.currentOffsetY / this.props.slideHeight) * 100;

      // updating last sent raw coordinates
      this.lastSentOffsetX = this.currentOffsetX;
      this.lastSentOffsetY = this.currentOffsetY;

      // sending the update to the server
      this.props.updateCursor({ xPercent, yPercent });
    }
  }

  mouseEnterHandler() {
    const intervalId = setInterval(this.checkCursor, 100);
    this.intervalId = intervalId;
  }

  mouseOutHandler() {
    // mouse left the whiteboard, removing the interval
    clearInterval(this.intervalId);
    this.intervalId = 0;

    // setting the coords to negative values and send the last message (the cursor will disappear)
    this.currentOffsetX = -1;
    this.currentOffsetY = -1;
    this.checkCursor();
  }

  render() {
    return (
      <foreignObject
        clipPath="url(#viewBox)"
        x="0"
        y="0"
        width={this.props.slideWidth}
        height={this.props.slideHeight}
      >
        <div
          onMouseOut={this.mouseOutHandler}
          onMouseEnter={this.mouseEnterHandler}
          onMouseMove={this.mouseMoveHandler}
          style={{ width: '100%', height: '100%' }}
        >
          {this.props.children}
        </div>
      </foreignObject>
    );
  }
}

PresentationOverlay.propTypes = {
  // Defines the calculated slide width (in svg coordinate system)
  slideWidth: PropTypes.number.isRequired,

  // Defines the calculated slide height (in svg coordinate system)
  slideHeight: PropTypes.number.isRequired,

  // A function to send a cursor update
  updateCursor: PropTypes.func.isRequired,

  // As a child we expect only a WhiteboardOverlay at this point
  children: PropTypes.element.isRequired,
};
