import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

const COLOR_VARIANT_TYPE = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
};

const SIZE_VARIANT_TYPE = {
  SMALL: 'sm',
  MEDIUM: 'md',
};

const Button = ({
  size,
  colorVariant,
  icon,
  noMargin,
  children,
}) => {
  let buttonColor = 'bg-white hover:bg-gray-200';
  let buttonSize = 'p-5 rounded-lg';
  let buttonMargin = ' mr-3';
  let iconSize = ' w-6 h-6';
  let buttonTransparent;

  if (colorVariant === COLOR_VARIANT_TYPE.SECONDARY) {
    buttonColor = 'bg-gray-100 hover:bg-gray-300';
  }

  if (colorVariant === COLOR_VARIANT_TYPE.ERROR) {
    buttonColor = 'bg-gray-100 hover:bg-gray-300';
  }

  if (size === SIZE_VARIANT_TYPE.SMALL) {
    buttonSize = 'p-3 rounded-md';
    buttonMargin = ' mr-2';
    iconSize = ' w-4 h-4';
  }

  if (noMargin) {
    buttonMargin = '';
  }

  return (
    <button
      type="button"
      className={cx('inline-flex items-center', buttonColor, buttonSize, buttonMargin, buttonTransparent)}
    >
      {children}

      {icon && <img src={`images/${icon}.svg`} className={cx('fill-current', iconSize)} alt="" />}
    </button>
  );
};

Button.defaultProps = {
  size: SIZE_VARIANT_TYPE.MEDIUM,
  colorVariant: COLOR_VARIANT_TYPE.PRIMARY,
  icon: '',
  noMargin: false,
  children: '',
};

Button.propTypes = {
  size: PropTypes.string,
  colorVariant: PropTypes.string,
  icon: PropTypes.string,
  noMargin: PropTypes.bool,
  children: PropTypes.node,
};

export default Button;
