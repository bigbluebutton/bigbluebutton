import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

const Icon = ({
  className,
  icon,
}) => (
  <img src={`images/${icon}.svg`} className={cx('fill-current', className)} alt="" />
);

Icon.propTypes = {
  icon: PropTypes.string.isRequired,
  className: PropTypes.string,
};

Icon.defaultProps = {
  className: '',
};

export default Icon;
