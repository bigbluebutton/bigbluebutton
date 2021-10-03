import React from 'react';
import PropTypes from 'prop-types';
import { styles } from '../styles';
import Icon from '../../icon/component';
import TooltipContainer from '/imports/ui/components/tooltip/container';

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
};

const defaultProps = {
  emoji: '',
  label: '',
  onKeyDown: null,
  onFocus: null,
  tabIndex: -1,
  hideLabel: false,
  onClick: null,
};

const ButtonEmoji = (props) => {
  const {
    hideLabel,
    ...newProps
  } = props;

  const {
    emoji,
    label,
    tabIndex,
    onClick,
  } = newProps;

  const IconComponent = (
    <Icon
      iconName={emoji}
      className={styles.emojiButtonIcon}
    />
  );

  return (
    <span>
      <TooltipContainer title={label}>
        <button
          type="button"
          tabIndex={tabIndex}
          {...newProps}
          className={styles.emojiButton}
          aria-label={label}
          onClick={onClick}
        >
          <span className={styles.label}>
            { !hideLabel && label }
            { IconComponent }
          </span>
        </button>
      </TooltipContainer>
    </span>
  );
};

export default ButtonEmoji;

ButtonEmoji.propTypes = propTypes;
ButtonEmoji.defaultProps = defaultProps;
