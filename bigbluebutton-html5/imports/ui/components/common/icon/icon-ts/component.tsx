import React, { memo } from 'react';
import cx from 'classnames';
import Styled from './styles';

interface IconProps {
  iconName: string;
  prependIconName?: string;
  rotate?: boolean;
  className?: string;
}

const Icon: React.FC<IconProps> = ({
  className = '',
  prependIconName = 'icon-bbb-',
  iconName = '',
  rotate = false,
}) => (
  <Styled.Icon
    className={cx(className, [prependIconName, iconName].join(''))}
    $rotate={rotate}
  />
);

export default memo(Icon);
