import React from 'react';
// import PropTypes from 'prop-types';

export default class PanZoomDrawListener extends React.Component {
  static calculateDistance({ x: x1, y: y1 }, { x: x2, y: y2 }) {
    return Math.sqrt(((x1 - x2) ** 2) + ((y1 - y2) ** 2));
  }

  constructor(props) {
    super(props);
    this.mouseDownHandler = this.mouseDownHandler.bind(this);
    this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
    this.mouseUpHandler = this.mouseUpHandler.bind(this);

    this.touchMoveHandler = this.touchMoveHandler.bind(this);
    this.touchStartHandler = this.touchStartHandler.bind(this);
    this.touchEndHandler = this.touchEndHandler.bind(this);

    this.pinchStartHandler = this.pinchStartHandler.bind(this);
    this.pinchMoveHandler = this.pinchMoveHandler.bind(this);
    this.pinchEndHandler = this.pinchEndHandler.bind(this);

    this.panMoveHandler = this.panMoveHandler.bind(this);
    this.updateTouchPoint = this.updateTouchPoint.bind(this);
    this.currentMouseX = 0;
    this.currentMouseY = 0;
    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;
    this.initialTouches = [];
    this.state = {
      pressed: false,
    };
    this.pinchGesture = false;
    this.prevDiff = -1;
  }


  mouseDownHandler(event) {
    const isLeftClick = event.button === 0;
    if (isLeftClick) {
      this.setState({
        pressed: true,
      });
    }
  }

  updateTouchPoint(event) {
    if (event.touches.length <= 0) return;
    const { clientX, clientY } = event.touches[0];
    this.currentMouseX = clientX;
    this.currentMouseY = clientY;
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
    this.updateTouchPoint(event);
    const numberTouches = event.touches.length;
    if (numberTouches === 2) {
      this.pinchGesture = true;
      this.pinchStartHandler(event);
    }
    if (numberTouches === 1) {
      this.pinchGesture = false;
      this.updateTouchPoint(event);
    }
  }

  touchMoveHandler(event) {
    if (this.pinchGesture) {
      this.pinchMoveHandler(event);
    }
    if (!this.pinchGesture) {
      this.panMoveHandler(event);
    }
  }

  touchEndHandler(event) {
    if (this.pinchGesture) {
      this.pinchEndHandler(event);
      this.pinchGesture = false;
    } else if (!this.pinchGesture) {
      this.updateTouchPoint(event);
    }
  }

  panMoveHandler(event) {
    if (this.pinchGesture) return;
    const { clientX, clientY } = event.changedTouches[0];
    this.mouseDeltaX = this.currentMouseX - clientX;
    this.mouseDeltaY = this.currentMouseY - clientY;
    this.props.pointChanger(this.mouseDeltaX, this.mouseDeltaY);
    this.currentMouseX = clientX;
    this.currentMouseY = clientY;
  }


  pinchStartHandler(event) {
    if (!this.pinchGesture) return;
    this.initialTouches = [...event.touches];
    let inputs = [];
    this.initialTouches.forEach((ev) => {
      inputs.push({
        x: ev.clientX,
        y: ev.clientY,
      });
    });
    this.prevDiff = PanZoomDrawListener.calculateDistance(...inputs);
    inputs = [];
    this.updateTouchPoint(event);
    this.props.touchUpdate(true);
  }

  pinchMoveHandler(event) {
    if (!this.pinchGesture) return;
    if (event.touches.length < 2) return;
    let inputs = [];
    [...event.touches].forEach((ev) => {
      inputs.push({
        x: ev.clientX,
        y: ev.clientY,
      });
    });
    const currDiff = PanZoomDrawListener.calculateDistance(...inputs);
    inputs = [];
    if (currDiff > 0) {
      if (currDiff > this.prevDiff) {
        this.props.zoomChanger(this.props.zoom + (100 * ((currDiff - this.prevDiff) / 100)));
      }
      if (currDiff < this.prevDiff) {
        this.props.zoomChanger(this.props.zoom - (100 * ((this.prevDiff - currDiff) / 100)));
      }
    }
    this.prevDiff = currDiff;
  }

  pinchEndHandler(event) {
    this.initialTouches = [];
    this.updateTouchPoint(event);
    this.pinchGesture = false;
    this.props.touchUpdate(false);
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
      onMouseMove={this.mouseMoveHandler}
      onMouseUp={this.mouseUpHandler}
      onMouseLeave={this.mouseUpHandler}
      onTouchStart={this.touchStartHandler}
      onTouchMove={this.touchMoveHandler}
      onTouchEnd={this.touchEndHandler}
    />);
  }
}
