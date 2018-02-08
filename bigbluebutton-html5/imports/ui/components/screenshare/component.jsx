import React from 'react';

export default class ScreenshareComponent extends React.Component {
  componentDidMount() {
    this.props.presenterScreenshareHasStarted();
  }

  render() {
    return (
      <video id="screenshareVideo" style={{ maxHeight: '100%', width: '100%' }} autoPlay playsInline />
    );
  }
}
