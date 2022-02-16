import React, { memo } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import _ from 'lodash';

const propTypes = {
  iconName: PropTypes.string.isRequired,
  prependIconName: PropTypes.string,
};

const defaultProps = {
  prependIconName: 'icon-bbb-',
};

const Icon = ({
  className,
  prependIconName,
  iconName,
  ...props
}) => (
  <i
    className={cx(className, [prependIconName, iconName].join(''))}
    // ToastContainer from react-toastify passes a useless closeToast prop here
    {..._.omit(props, ['closeToast', 'animations'])}
  />
);

export default memo(Icon);

Icon.propTypes = propTypes;
Icon.defaultProps = defaultProps;
