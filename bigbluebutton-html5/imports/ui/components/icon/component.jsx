import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

const propTypes = {
  iconName: PropTypes.string.isRequired,
  prependIconName: PropTypes.string,
};

const defaultProps = {
  prependIconName: 'icon-bbb-',
};

const Icon = ({ className, prependIconName, iconName, ...otherProps }) => (
  <i
    className={cx(className, [prependIconName, iconName].join(''))}
    {...otherProps}
  />
   );

export default Icon;

Icon.propTypes = propTypes;
Icon.defaultProps = defaultProps;
