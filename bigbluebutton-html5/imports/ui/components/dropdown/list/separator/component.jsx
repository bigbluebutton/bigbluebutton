import React, { Component, PropTypes } from 'react';
import styles from '../styles';
import cx from 'classnames';

export default class DropdownListSeparator extends Component {
  render() {
    const { style, className } = this.props;
    return <li style={style} className={cx(styles.separator, className)} role="separator" />;
  }
}
