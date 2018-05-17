import React from 'react';
// import PropTypes from 'prop-types';

export default class PanZoomDrawListener extends React.Component {
  constructor(props) {
    super(props);

    this.mouseDownHandler = this.mouseDownHandler.bind(this);
    this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
    this.mouseUpHandler = this.mouseUpHandler.bind(this);
  }

  mouseDownHandler() {
    this.dummyValue = '';
  }

  mouseMoveHandler() {
    this.dummyValue = '';
  }

  mouseUpHandler() {
    this.dummyValue = '';
  }

  render() {
    return (<div />);
  }
}
