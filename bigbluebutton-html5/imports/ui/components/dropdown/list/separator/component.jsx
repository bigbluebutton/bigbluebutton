import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { styles } from '../styles';

const DropdownListSeparator = ({ style, className }) =>
  (
    <li style={style} className={cx(styles.separator, className)} />
  );

DropdownListSeparator.propTypes = {
  style: PropTypes.shape({}),
  className: PropTypes.string,
};

DropdownListSeparator.defaultProps = {
  style: null,
  className: null,
};

export default DropdownListSeparator;
