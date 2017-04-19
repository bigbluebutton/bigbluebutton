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
    // console.log(this.props);
    return (
      <div>
      </div>
    );
  }
}
