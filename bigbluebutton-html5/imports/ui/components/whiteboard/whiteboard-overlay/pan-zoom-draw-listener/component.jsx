import React from 'react';
// import PropTypes from 'prop-types';

export default class PanZoomDrawListener extends React.Component {
  constructor(props) {
    super(props);
    this.mouseDownHandler = this.mouseDownHandler.bind(this);
    this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
    this.mouseUpHandler = this.mouseUpHandler.bind(this);
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
      cursor: this.state.pressed ? `url('${baseName}/resources/images/whiteboard-cursor/pencil.svg') 2 22, default` : '',
    };
    return (<div
      style={pencilDrawStyle}
      onMouseDown={this.mouseDownHandler}
      onMouseUp={this.mouseUpHandler}
      onMouseLeave={this.mouseUpHandler}
      onMouseMove={this.mouseMoveHandler}
      />);
  }
}
