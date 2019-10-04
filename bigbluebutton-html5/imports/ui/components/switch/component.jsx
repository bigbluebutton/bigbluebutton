import React from 'react';
import Toggle from 'react-toggle';
import cx from 'classnames';
import { defineMessages, injectIntl } from 'react-intl';
import { styles } from './styles';

const intlMessages = defineMessages({
  on: {
    id: 'app.switch.onLabel',
    description: 'label for toggle switch on state',
  },
  off: {
    id: 'app.switch.offLabel',
    description: 'label for toggle switch off state',
  },
});

const defaultProps = {
  showToggleLabel: true,
  invertColors: false,
};

class Switch extends Toggle {
  render() {
    const {
      intl,
      className,
      icons: _icons,
      ariaLabelledBy,
      ariaDescribedBy,
      ariaLabel,
      ariaDesc,
      showToggleLabel,
      invertColors,
      disabled,
      ...inputProps
    } = this.props;

    const {
      checked,
      hasFocus,
    } = this.state;

    const classes = cx('react-toggle', {
      'react-toggle--checked': checked,
      'react-toggle--focus': hasFocus,
      'react-toggle--disabled': disabled,
    }, className);

    return (
      <div
        className={cx(classes, styles.switch)}
        onClick={this.handleClick}
        onTouchStart={this.handleTouchStart}
        onTouchMove={this.handleTouchMove}
        onTouchEnd={this.handleTouchEnd}
      >
        <div
          className={cx('react-toggle-track',
            invertColors && styles.invertBackground,
            checked && styles.checked)}
          aria-hidden="true"
        >
          <div className="react-toggle-track-check">
            {showToggleLabel ? intl.formatMessage(intlMessages.on) : null}
          </div>
          <div className="react-toggle-track-x">
            {showToggleLabel ? intl.formatMessage(intlMessages.off) : null}
          </div>
        </div>
        <div className="react-toggle-thumb" />

        <input
          {...inputProps}
          ref={(ref) => { this.input = ref; }}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          className="react-toggle-screenreader-only"
          type="checkbox"
          tabIndex="0"
          disabled={disabled}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
        />
        <div id={ariaDescribedBy} hidden>{ariaDesc}</div>
      </div>
    );
  }
}

Switch.defaultProps = defaultProps;

export default injectIntl(Switch);
