import React, { memo } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { omit } from 'radash';
import Styled from './styles';

const propTypes = {
  iconName: PropTypes.string.isRequired,
  prependIconName: PropTypes.string,
  rotate: PropTypes.bool,
  className: PropTypes.string,
  color: PropTypes.string,
};

const Icon = ({
  className = '',
  prependIconName = 'icon-bbb-',
  iconName,
  rotate = false,
  color = undefined,
  ...props
}) => (
  <Styled.Icon
    color={color}
    className={cx(className, [prependIconName, iconName].join(''))}
    // ToastContainer from react-toastify passes a useless closeToast prop here
    {...omit(props, ['closeToast', 'animations', 'loading'])}
    $rotate={rotate}
  />
);

export default memo(Icon);

Icon.propTypes = propTypes;
