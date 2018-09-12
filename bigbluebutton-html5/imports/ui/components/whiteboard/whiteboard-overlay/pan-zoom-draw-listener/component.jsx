import React from 'react';
// import PropTypes from 'prop-types';

export default class PanZoomDrawListener extends React.Component {
  constructor(props) {
    super(props);
    this.mouseDownHandler = this.mouseDownHandler.bind(this);
    this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
    this.mouseUpHandler = this.mouseUpHandler.bind(this);
    this.touchMoveHandler = this.touchMoveHandler.bind(this);
    this.touchStartHandler = this.touchStartHandler.bind(this);
    this.currentMouseX = 0;
    this.currentMouseY = 0;
    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;
    this.state = {
      pressed: false,
    };
  }

  mouseDownHandler(event) {
    const isLeftClick = event.button === 0;
    if (isLeftClick) {
      this.setState({
        pressed: true,
      });
    }
  }

  mouseMoveHandler(event) {
    if (this.state.pressed) {
      this.mouseDeltaX = this.currentMouseX - event.clientX;
      this.mouseDeltaY = this.currentMouseY - event.clientY;
      this.props.pointChanger(this.mouseDeltaX, this.mouseDeltaY);
    }
    this.currentMouseX = event.clientX;
    this.currentMouseY = event.clientY;
  }

  touchStartHandler(event) {
    const { clientX, clientY } = event.changedTouches[0];
    this.currentMouseX = clientX;
    this.currentMouseY = clientY;
  }

  touchMoveHandler(event) {
    const { clientX, clientY } = event.changedTouches[0];
    this.mouseDeltaX = this.currentMouseX - clientX;
    this.mouseDeltaY = this.currentMouseY - clientY;
    this.props.pointChanger(this.mouseDeltaX, this.mouseDeltaY);
    this.currentMouseX = clientX;
    this.currentMouseY = clientY;
  }

  mouseUpHandler(event) {
    const isLeftClick = event.button === 0;

    if (isLeftClick) {
      this.setState({
        pressed: false,
      });
    }
  }

  render() {
    const baseName = Meteor.settings.public.app.basename;
    const pencilDrawStyle = {
      width: '100%',
      height: '100%',
      touchAction: 'none',
      zIndex: 2 ** 31 - 1, // maximun value of z-index to prevent other things from overlapping
      cursor: this.state.pressed ? `url('${baseName}/resources/images/whiteboard-cursor/pan-closed.png') 4 8 ,  default`
        : `url('${baseName}/resources/images/whiteboard-cursor/pan.png') 4 8,  default`,
    };
    return (<div
      style={pencilDrawStyle}
      onMouseDown={this.mouseDownHandler}
      onTouchStart={this.touchStartHandler}
      onMouseUp={this.mouseUpHandler}
      onMouseLeave={this.mouseUpHandler}
      onMouseMove={this.mouseMoveHandler}
      onTouchMove={this.touchMoveHandler}
    />);
  }
}
