import React, { Component, PropTypes } from 'react';
import styles from './styles';

export default class DropdownContent extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return <div>{this.props.children}</div>;
  }
}
