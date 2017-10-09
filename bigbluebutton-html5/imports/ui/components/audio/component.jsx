import React, { Component } from 'react';

export default class Audio extends Component {
  componentDidMount() {
    console.log('KKKKKKKK');
    this.props.init.call(this);
  }

  render() {
    return (<audio id="remote-media" autoPlay="autoplay" />);
  }
}
