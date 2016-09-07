import React, { Component, PropTypes } from 'react';
import styles from '../styles';

export default class DropdownListSeparator extends Component {
  render() {
    return <li className={styles.separator} role="separator" />;
  }
}
