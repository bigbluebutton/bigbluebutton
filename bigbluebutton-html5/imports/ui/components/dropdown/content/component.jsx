import React, { Component, PropTypes } from 'react';
import styles from '../styles';

export default class DropdownContent extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <div className={styles.content}>{this.props.children}</div>;
  }
}
