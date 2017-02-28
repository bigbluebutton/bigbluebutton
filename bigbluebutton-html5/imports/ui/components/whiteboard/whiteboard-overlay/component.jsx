import React, { PropTypes } from 'react';

export default class WhiteboardOverlay extends React.Component {
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

    this.mouseDownHandler = this.mouseDownHandler.bind(this);
  }

  mouseDownHandler(event) {
    console.log('mouseDown');
    console.log(event.nativeEvent.offsetX);
    console.log(event.nativeEvent.offsetY);
  }

  render() {
    return (
      <div style={{ width: '100%', height: '100%' }} onMouseDown={this.mouseDownHandler} />
    );
  }
}
