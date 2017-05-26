import React, { PropTypes } from 'react';

export default class PresentationOverlay extends React.Component {
  constructor(props) {
    super(props);

    //last sent coordinates
    this.lastSentOffsetX = 0,
    this.lastSentOffsetY = 0,

    //last updated coordinates
    this.currentOffsetX = 0;
    this.currentOffsetY = 0;

    //id of the setInterval()
    this.intervalId = 0,

    this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
    this.checkCursor = this.checkCursor.bind(this);
    this.mouseEnterHandler = this.mouseEnterHandler.bind(this);
    this.mouseOutHandler = this.mouseOutHandler.bind(this);
  }

  mouseMoveHandler(event) {
    //for the case where you change settings in one of the lists (which are displayed on the slide)
    //the mouse starts pointing to the slide right away and mouseEnter doesn't fire
    //so we call it manually here
    if(!this.intervalId) {
      this.mouseEnterHandler();
    }

    this.currentOffsetX = event.nativeEvent.offsetX;
    this.currentOffsetY = event.nativeEvent.offsetY;
  }

  checkCursor() {

    //check if the cursor hasn't moved since last check
    if (this.lastSentOffsetX != this.currentOffsetX
      || this.lastSentOffsetY != this.currentOffsetY) {

      //determining cursor's position as percentages within the viewBox
      let xPercent = ( this.currentOffsetX - this.props.viewBoxX ) / this.props.vbwidth;
      let yPercent = ( this.currentOffsetY - this.props.viewBoxY ) / this.props.vbheight;

      //send the update to the server
      this.props.updateCursor({ xPercent: xPercent, yPercent: yPercent });

      //updating last sent raw coordinates
      this.lastSentOffsetX = this.currentOffsetX;
      this.lastSentOffsetY = this.currentOffsetY;
    }
  }

  mouseEnterHandler(event) {
    let intervalId = setInterval(this.checkCursor, 100);
    this.intervalId = intervalId;
  }

  mouseOutHandler(event) {
    clearInterval(this.intervalId);
    this.intervalId = 0;
  }

  render() {
    return (
      <foreignObject
        clipPath="url(#viewBox)"
        x={this.props.x}
        y={this.props.y}
        width={this.props.vbwidth}
        height={this.props.vbheight}
      >
        { this.props.isUserPresenter ?
          <div
            onMouseOut={this.mouseOutHandler}
            onMouseEnter={this.mouseEnterHandler}
            onMouseMove={this.mouseMoveHandler}
            style={{ width: '100%', height: '100%' }}
          >
            {this.props.children}
          </div>
        : null }
      </foreignObject>
    );
  }
}
