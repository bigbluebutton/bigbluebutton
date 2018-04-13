import React from 'react';
// import PropTypes from 'prop-types';
// import { styles } from '../styles.scss';

export default class PanZoomDrawListener extends React.Component {
  constructor(props) {
    super(props);

    this.mouseDownHandler = this.mouseDownHandler.bind(this);
    this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
    this.mouseUpHandler = this.mouseUpHandler.bind(this);
  }

  mouseDownHandler() {
    console.log('oi');
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
