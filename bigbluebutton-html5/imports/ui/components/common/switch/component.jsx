import React from 'react';
import Toggle from 'react-toggle';
import { defineMessages, injectIntl } from 'react-intl';
import Settings from '/imports/ui/services/settings';
import Styled from './styles';

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

    const { animations } = Settings.application;

    const {
      checked,
      hasFocus,
    } = this.state;

    return (
      <Styled.Switch
        onClick={this.handleClick}
        onTouchStart={this.handleTouchStart}
        onTouchMove={this.handleTouchMove}
        onTouchEnd={this.handleTouchEnd}
        disabled={disabled}
        animations={animations}
      >
        <Styled.ToggleTrack
          aria-hidden="true"
          checked={checked}
          invertColors={invertColors}
          animations={animations}
        >
          <Styled.ToggleTrackCheck checked={checked} animations={animations}>
            {showToggleLabel ? intl.formatMessage(intlMessages.on) : null}
          </Styled.ToggleTrackCheck>
          <Styled.ToggleTrackX checked={checked} animations={animations}>
            {showToggleLabel ? intl.formatMessage(intlMessages.off) : null}
          </Styled.ToggleTrackX>
        </Styled.ToggleTrack>
        <Styled.ToggleThumb
          checked={checked}
          hasFocus={hasFocus}
          disabled={disabled}
          animations={animations}
          isRTL={document.getElementsByTagName('html')[0].dir === 'rtl'}
        />

        <Styled.ScreenreaderInput
          {...inputProps}
          ref={(ref) => { this.input = ref; }}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          type="checkbox"
          tabIndex="0"
          disabled={disabled}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
        />
        <div id={ariaDescribedBy} hidden>{ariaDesc}</div>
      </Styled.Switch>
    );
  }
}

Switch.defaultProps = defaultProps;

export default injectIntl(Switch);
