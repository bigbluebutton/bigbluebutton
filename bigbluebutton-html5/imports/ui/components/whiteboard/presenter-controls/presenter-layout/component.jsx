import React, { PropTypes } from 'react';

export default class PresenterLayout extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      //last sent coordinates
      offsetX: 0,
      offsetY: 0,

      //last updated coordinated
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
      this.props.updateCursor({ x_percent: xPercent, y_percent: yPercent });
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
          />
        : null }
      </foreignObject>
    );
  }
}
