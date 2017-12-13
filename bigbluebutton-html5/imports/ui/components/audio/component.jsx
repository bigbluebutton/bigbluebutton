import { Component } from 'react';
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
    return null;
  }
}

Audio.propTypes = propTypes;
