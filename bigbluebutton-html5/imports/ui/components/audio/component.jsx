import React, { Component } from 'react';

export default class Audio extends Component {
  componentDidMount() {
    this.props.init.call(this);
  }

  render() {
    return (<audio id="remote-media" autoPlay="autoplay" />);
  }
}
