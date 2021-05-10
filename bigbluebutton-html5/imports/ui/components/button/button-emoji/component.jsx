import React from 'react';
import PropTypes from 'prop-types';
import { styles } from '../styles';
import Icon from '../../icon/component';

const propTypes = {
  /**
   * Defines the name of the emoji to be used, as defined in bbb-icons.css
   * @type String
   * @defaultValue ''
   */
  emoji: PropTypes.string,

  onClick: PropTypes.func,

  onKeyDown: PropTypes.func,

  onFocus: PropTypes.func,
};

const defaultProps = {
  emoji: '',
  onClick: null,
  onKeyDown: null,
  onFocus: null,
};

const ButtonEmoji = (props) => {
  const {
    emoji,
  } = props;

  const IconComponent = (
    <Icon
      iconName={emoji}
      className={styles.emojiButtonIcon}
    />
  );

  return (
    <span className={styles.emojiButtonContainer}>
      <div
        tabIndex={-1}
        {...props}
        className={styles.emojiButton}
      >
        { IconComponent }
      </div>
    </span>
  );
};

export default ButtonEmoji;

ButtonEmoji.propTypes = propTypes;
ButtonEmoji.defaultProps = defaultProps;
