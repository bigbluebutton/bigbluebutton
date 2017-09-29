import React, { Component } from 'react';

export default class Audio extends Component {
  constructor(props) {
    super(props);
    props.init.call(this);
  }

  render() {
    return (<audio id="remote-media" autoPlay="autoplay" />);
  }
}
