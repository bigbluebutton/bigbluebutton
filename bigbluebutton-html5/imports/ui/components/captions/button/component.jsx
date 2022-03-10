import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Styled from './styles';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
  handleOnClick: PropTypes.func.isRequired,
};

const intlMessages = defineMessages({
  start: {
    id: 'app.actionsBar.captions.start',
    description: 'Start closed captions option',
  },
  stop: {
    id: 'app.actionsBar.captions.stop',
    description: 'Stop closed captions option',
  },
});

const CaptionsButton = ({ intl, isActive, handleOnClick }) => (
  <Styled.CaptionsButton
    icon="closed_caption"
    label={intl.formatMessage(isActive ? intlMessages.stop : intlMessages.start)}
    color={isActive ? 'primary' : 'default'}
    ghost={!isActive}
    hideLabel
    circle
    size="lg"
    onClick={handleOnClick}
    id={isActive ? 'stop-captions-button' : 'start-captions-button'}
  />
);

CaptionsButton.propTypes = propTypes;
export default injectIntl(CaptionsButton);
