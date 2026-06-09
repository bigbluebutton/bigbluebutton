import React, { memo } from 'react';
import cx from 'classnames';
import Styled from './styles';

interface IconProps {
  iconName: string;
  prependIconName?: string;
  rotate?: boolean;
  className?: string;
  ariaLabel?: string;
  ariaHidden?: boolean;
}

const Icon: React.FC<IconProps> = ({
  ariaHidden,
  ariaLabel,
  className = '',
  prependIconName = 'icon-bbb-',
  iconName = '',
  rotate = false,
}) => {
  const isAriaHidden = ariaHidden ?? !ariaLabel;

  return (
    <Styled.Icon
      aria-hidden={isAriaHidden}
      aria-label={isAriaHidden ? undefined : ariaLabel}
      role={isAriaHidden ? undefined : 'img'}
      className={cx(className, [prependIconName, iconName].join(''))}
      $rotate={rotate}
    />
  );
};

export default memo(Icon);
