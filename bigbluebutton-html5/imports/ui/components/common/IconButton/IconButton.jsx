import React from 'react';
import cx from 'classnames';

import Icon from '/imports/ui/components/Icon';

const COLOR_TYPE = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  ERROR: 'error',
};

const SIZE_TYPE = {
  SMALL: 'sm',
  MEDIUM: 'md',
};

const IconButton = ({
  size,
  color,
  icon,
  transparent,
  miscClass,
  noMargin,
  disabled,
  onClick,
  children,
}) => {
  let buttonClass = 'inline-flex items-center justify-center';
  let buttonColor = 'bg-white hover:bg-gray-200';
  let buttonSize = 'min-h-64 min-w-64 rounded-lg';
  let buttonMargin = ' mr-3';
  let iconSize = ' w-6 h-6';
  let buttonTransparent;
  let iconMinVh = 'min-w-20 min-h-20';

  if (color === COLOR_TYPE.PRIMARY) {
    buttonColor = 'bg-white hover:bg-gray-200';
  }

  if (color === COLOR_TYPE.SECONDARY) {
    buttonColor = 'bg-gray-100 hover:bg-gray-300';
  }

  if (color === COLOR_TYPE.ERROR) {
    buttonColor = 'bg-red-200 hover:bg-red-400';
  }

  if (size === SIZE_TYPE.SMALL) {
    buttonSize = 'min-h-40 min-w-40 rounded-md';
    buttonMargin = ' mr-2';
    iconSize = ' w-4 h-4';
    iconMinVh = 'min-w-15 min-h-15';
  }

  if (noMargin) {
    buttonMargin = '';
  }

  if (transparent) {
    buttonClass = '';
    buttonColor = '';
    buttonSize = '';
    iconSize = '';
    buttonTransparent = 'bg-transparent';
  }

  return (
    <button
      type="button"
      className={
        cx(
          buttonClass,
          buttonColor,
          buttonSize,
          buttonMargin,
          buttonTransparent,
          miscClass,
        )
      }
      onClick={onClick}
      disabled={disabled}
    >
      {children}
      {icon && <Icon icon={icon} className={iconSize} iconvh={iconMinVh} />}
    </button>
  );
};

export default IconButton;
