import React, { memo } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { omit } from 'radash';
import Styled from './styles';

const propTypes = {
  iconName: PropTypes.string.isRequired,
  prependIconName: PropTypes.string,
  rotate: PropTypes.bool,
};

const defaultProps = {
  prependIconName: 'icon-bbb-',
  rotate: false,
};

const Icon = ({
  className,
  prependIconName,
  iconName,
  rotate,
  ...props
}) => (
  <Styled.Icon
    className={cx(className, [prependIconName, iconName].join(''))}
    // ToastContainer from react-toastify passes a useless closeToast prop here
    {...omit(props, ['closeToast', 'animations', 'loading'])}
    $rotate={rotate}
  />
);

export default memo(Icon);

Icon.propTypes = propTypes;
Icon.defaultProps = defaultProps;
