import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Styled from './styles';

const intlMessages = defineMessages({
  switchButtonShrink: {
    id: 'app.switchButton.shrinkLabel',
    description: 'shrink label',
  },
  switchButtonExpand: {
    id: 'app.switchButton.expandLabel',
    description: 'expand label',
  },
});

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  dark: PropTypes.bool,
  bottom: PropTypes.bool,
  handleSwitch: PropTypes.func,
  switched: PropTypes.bool,
};

const defaultProps = {
  dark: false,
  bottom: false,
  handleSwitch: () => {},
  switched: false,
};

const SwitchButtonComponent = (props) => {
  const {
    intl,
    dark,
    bottom,
    handleSwitch,
    switched,
  } = props;
  const formattedLabel = intl.formatMessage(switched
    ? intlMessages.switchButtonShrink
    : intlMessages.switchButtonExpand);

  return (
    <Styled.SwitchButtonWrapper dark={dark} bottom={bottom}>
      <Styled.SwitchButton
        color="default"
        icon={switched ? 'screenshare-close-fullscreen' : 'screenshare-fullscreen'}
        size="sm"
        onClick={handleSwitch}
        label={formattedLabel}
        hideLabel
        data-test="switchButton"
      />
    </Styled.SwitchButtonWrapper>
  );
};

SwitchButtonComponent.propTypes = propTypes;
SwitchButtonComponent.defaultProps = defaultProps;

export default injectIntl(SwitchButtonComponent);
