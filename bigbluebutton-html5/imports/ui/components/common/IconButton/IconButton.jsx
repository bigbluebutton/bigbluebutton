import React from 'react';
import PropTypes from 'prop-types';
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
  let buttonClass = 'inline-flex items-center';
  let buttonColor = 'bg-white hover:bg-gray-200';
  let buttonSize = 'p-5 rounded-lg';
  let buttonMargin = ' mr-3';
  let iconSize = ' w-6 h-6';
  let buttonTransparent;
  let iconMinVh = {
    minWidth: '20px',
    minHeight: '20px',
  };

  if (color === COLOR_TYPE.SECONDARY) {
    buttonColor = 'bg-gray-100 hover:bg-gray-300';
  }

  if (color === COLOR_TYPE.ERROR) {
    buttonColor = 'bg-red-200 hover:bg-red-400';
  }

  if (size === SIZE_TYPE.SMALL) {
    buttonSize = 'p-3 rounded-md';
    buttonMargin = ' mr-2';
    iconSize = ' w-4 h-4';
    iconMinVh = {
      minWidth: '15px',
      minHeight: '15px',
    };
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

IconButton.defaultProps = {
  size: SIZE_TYPE.MEDIUM,
  color: COLOR_TYPE.PRIMARY,
  icon: '',
  transparent: false,
  noMargin: false,
  disabled: false,
  miscClass: '',
  children: '',
};

IconButton.propTypes = {
  size: PropTypes.string,
  color: PropTypes.string,
  icon: PropTypes.string,
  transparent: PropTypes.bool,
  noMargin: PropTypes.bool,
  disabled: PropTypes.bool,
  miscClass: PropTypes.string,
  children: PropTypes.node,
};

export default IconButton;
