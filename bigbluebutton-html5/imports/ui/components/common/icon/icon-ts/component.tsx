import React, { memo } from 'react';
import cx from 'classnames';
import Styled from './styles';

interface IconProps {
  iconName: string;
  prependIconName?: string;
  rotate?: boolean;
  className?: string;
}

const defaultProps = {
  prependIconName: 'icon-bbb-',
  rotate: false,
  className: '',
};

const Icon: React.FC<IconProps> = ({
  className,
  prependIconName,
  iconName,
  rotate = false,
}) => (
  <Styled.Icon
    className={cx(className, [prependIconName, iconName].join(''))}
    $rotate={rotate}
  />
);

Icon.defaultProps = defaultProps;

export default memo(Icon);
