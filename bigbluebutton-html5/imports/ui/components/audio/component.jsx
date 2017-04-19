import React, { Component } from 'react';
import { init } from './service';

export default class Audio extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    init();
  }

  render() {
    return (
      <audio id="remote-media" autoPlay="autoplay">
      </audio>
    );
  }
}
