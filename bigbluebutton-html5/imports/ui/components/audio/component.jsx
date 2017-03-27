import React, { Component } from 'react';

export default class Audio extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { modal } = this.props;

    // console.log(this.props);
    return (
      <div>
        {modal}
      </div>
    );
  }
}
