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
};

const defaultProps = {
  emoji: '',
  label: '',
  onClick: null,
  onKeyDown: null,
  onFocus: null,
};

const ButtonEmoji = (props) => {
  const {
    emoji,
    label,
  } = props;

  const IconComponent = (
    <Icon
      iconName={emoji}
      className={styles.emojiButtonIcon}
    />
  );

  return (
    <span>
      <TooltipContainer title={label}>
        <div
          tabIndex={-1}
          {...props}
          className={styles.emojiButton}
        >
          <span className={styles.label}>
            {label}
            { IconComponent }
          </span>
        </div>
      </TooltipContainer>
    </span>
  );
};

export default ButtonEmoji;

ButtonEmoji.propTypes = propTypes;
ButtonEmoji.defaultProps = defaultProps;
