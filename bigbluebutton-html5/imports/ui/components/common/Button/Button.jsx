import React from 'react';
import cx from 'classnames';

const COLOR_TYPE = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
};

const SIZE_TYPE = {
  SMALL: 'sm',
  MEDIUM: 'md',
};

const VARIANT_TYPE = {
  CONATINED: 'contained',
  OUTLINED: 'outlined',
};

const FONT_WEIGHT_TYPE = {
  BOLD: 'bold',
  SEMIBOLD: 'semibold',
};

const Button = ({
  size,
  color,
  variant,
  fontWeight,
  onClick,
  children,
}) => {
  let buttonColor = 'bg-white hover:bg-gray-200';
  let buttonSize = 'py-2 px-4 text-md rounded-md';
  let buttonFontWeight;

  if (color === COLOR_TYPE.PRIMARY && variant === VARIANT_TYPE.OUTLINED) {
    buttonColor = 'text-gray-700 hover:bg-gray-500 hover:text-white border border-gray-500 bg-transparent hover:border-transparent';
  }

  if (color === COLOR_TYPE.SECONDARY && variant === VARIANT_TYPE.CONATINED) {
    buttonColor = 'bg-red-100 hover:bg-red-300';
  }

  if (color === COLOR_TYPE.SECONDARY && variant === VARIANT_TYPE.OUTLINED) {
    buttonColor = 'text-red-700 hover:bg-red-500 hover:text-white border border-red-500';
  }

  if (size === SIZE_TYPE.SMALL) {
    buttonSize = 'py-1 px-2 rounded-sm';
  }

  if (fontWeight === FONT_WEIGHT_TYPE.BOLD) {
    buttonFontWeight = 'font-bold';
  }

  if (fontWeight === FONT_WEIGHT_TYPE.SEMIBOLD) {
    buttonFontWeight = 'font-semibold';
  }

  return (
    <button
      type="button"
      className={cx('inline-flex items-center', buttonColor, buttonSize, buttonFontWeight)}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
