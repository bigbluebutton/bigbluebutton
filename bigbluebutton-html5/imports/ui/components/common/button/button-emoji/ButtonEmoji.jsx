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

const defaultProps = {
  emoji: '',
  label: '',
  onKeyDown: null,
  onFocus: null,
  tabIndex: -1,
  hideLabel: false,
  onClick: null,
  className: '',
  rotate: false,
};

const ButtonEmoji = (props) => {
  const {
    hideLabel,
    className,
    hidden,
    rotate,
    ...newProps
  } = props;

  const {
    emoji,
    label,
    tabIndex,
    onClick,
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
ButtonEmoji.defaultProps = defaultProps;
