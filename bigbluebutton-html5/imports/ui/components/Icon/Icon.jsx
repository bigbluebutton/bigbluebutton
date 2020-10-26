import React from 'react';
import cx from 'classnames';

const Icon = ({
  className,
  icon,
  iconvh,
}) => (
  <img src={`images/${icon}.svg`} className={cx('fill-current', className)} style={iconvh} alt="" />
);

export default Icon;
