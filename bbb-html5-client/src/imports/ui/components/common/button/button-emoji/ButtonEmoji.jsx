import React from 'react';
import PropTypes from 'prop-types';
import Styled from './styles';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';

const propTypes = {
  /**
   * Defines the name of the emoji to be used, as defined in bbb-icons.css
   * @type String
   * @defaultValue ''
   */
  emoji: PropTypes.string,

  label: PropTypes.string,

  onClick: PropTypes.func,

  onKeyDown: PropTypes.func,

  onFocus: PropTypes.func,

  tabIndex: PropTypes.number,

  hideLabel: PropTypes.bool,

  className: PropTypes.string,

  rotate: PropTypes.bool,
};

const ButtonEmoji = (props) => {
  const {
    hideLabel = false,
    className = '',
    hidden,
    rotate = false,
    ...newProps
  } = props;

  const {
    emoji = '',
    label = '',
    tabIndex = -1,
    onClick = null,
    onKeyDown = null,
    onFocus = null,
  } = newProps;

  const IconComponent = (<Styled.EmojiButtonIcon iconName={emoji} rotate={rotate} />);

  return (
    <span>
      <Styled.EmojiButtonSpace hidden={hidden} />
      <TooltipContainer title={label}>
        <Styled.EmojiButton
          type="button"
          tabIndex={tabIndex}
          {...newProps}
          aria-label={label}
          onClick={onClick}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          className={className}
        >
          <Styled.Label>
            { !hideLabel && label }
            { IconComponent }
          </Styled.Label>
        </Styled.EmojiButton>
      </TooltipContainer>
    </span>
  );
};

export default ButtonEmoji;

ButtonEmoji.propTypes = propTypes;
