import React, { PropTypes } from 'react';

export default class PresentationOverlay extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      //last sent coordinates
      offsetX: 0,
      offsetY: 0,

      //last updated coordinates
      lastOffsetX: 0,
      lastOffsetY: 0,

      //id of the setInterval()
      intervalId: 0,
    };
    this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
    this.checkCursor = this.checkCursor.bind(this);
    this.mouseEnterHandler = this.mouseEnterHandler.bind(this);
    this.mouseOutHandler = this.mouseOutHandler.bind(this);
  }

  mouseMoveHandler(event) {
    //for the case where you change settings in one of the lists (which are displayed on the slide)
    //the mouse starts pointing to the slide right away and mouseEnter doesn't fire
    //so we call it manually here
    if(!this.state.intervalId) {
      this.mouseEnterHandler();
    }

    this.setState({
      lastOffsetX: event.nativeEvent.offsetX,
      lastOffsetY: event.nativeEvent.offsetY,
    });
  }

  checkCursor() {
    if (this.state.offsetX != this.state.lastOffsetX
      && this.state.offsetY != this.state.lastOffsetY) {

      let xPercent = this.state.lastOffsetX / this.props.vbwidth;
      let yPercent = this.state.lastOffsetY / this.props.vbheight;
      this.props.updateCursor({ xPercent: xPercent, yPercent: yPercent });
      this.setState({
        offsetX: this.state.lastOffsetX,
        offsetY: this.state.lastOffsetY,
      });
    }
  }

  mouseEnterHandler(event) {
    let intervalId = setInterval(this.checkCursor, 100);
    this.setState({ intervalId: intervalId });
  }

  mouseOutHandler(event) {
    clearInterval(this.state.intervalId);
    this.setState({ intervalId: 0 });
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
