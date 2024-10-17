import React from 'react';
import Styled from './styles';
import Icon from '/imports/ui/components/common/icon/component';

interface EmojiButtonProps extends React.ComponentProps<'button'> {
  icon: string;
}

const EmojiButton = React.forwardRef<HTMLButtonElement, EmojiButtonProps>((props, ref) => {
  const {
    icon,
    ...buttonProps
  } = props;

  const IconComponent = (<Icon iconName={icon} />);

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Styled.EmojiButton {...buttonProps} ref={ref}>
      {IconComponent}
    </Styled.EmojiButton>
  );
});

export default EmojiButton;
