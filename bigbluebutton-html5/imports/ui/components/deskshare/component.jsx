import React from 'react';

export default class DeskshareComponent extends React.Component {
  componentDidMount() {
    this.props.presenterDeskshareHasStarted();
  }

  render() {
    return (
      <video id="deskshareVideo" style={{ height: '100%', width: '100%' }} />
    );
  }
}
