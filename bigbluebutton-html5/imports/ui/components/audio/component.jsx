import React, { Component } from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  init: PropTypes.func.isRequired,
};

export default class Audio extends Component {
  constructor(props) {
    super(props);

    this.init = props.init.bind(this);
  }

  componentDidMount() {
    this.init();
  }

  render() {
    return (
      <audio id="remote-media" autoPlay="autoplay">
        <track kind="captions" /> {/* These captions are brought to you by eslint */}
      </audio>
    );
  }
}

Audio.propTypes = propTypes;
