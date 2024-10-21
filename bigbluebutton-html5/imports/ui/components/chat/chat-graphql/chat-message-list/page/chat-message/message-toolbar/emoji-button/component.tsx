import React from 'react';
import Styled from './styles';
import Icon from '/imports/ui/components/common/icon/component';
import SvgIcon from '/imports/ui/components/common/icon-svg/component';

interface EmojiButtonProps extends React.ComponentProps<'button'> {
  icon?: string;
  svgIcon?: string;
}

const EmojiButton = React.forwardRef<HTMLButtonElement, EmojiButtonProps>((props, ref) => {
  const {
    icon,
    svgIcon,
    ...buttonProps
  } = props;

  let IconComponent: React.ReactNode = null;

  if (icon) {
    IconComponent = (<Icon iconName={icon} />);
  } else if (svgIcon) {
    IconComponent = (<SvgIcon iconName={svgIcon} />);
  }

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Styled.EmojiButton {...buttonProps} ref={ref}>
      {IconComponent}
    </Styled.EmojiButton>
  );
});

export default EmojiButton;
