import React from 'react';
import cx from 'classnames';
import styles from '../styles';

const DropdownListSeparator = ({ style, className }) => (
  <li style={style} className={cx(styles.separator, className)} />);

export default DropdownListSeparator;
