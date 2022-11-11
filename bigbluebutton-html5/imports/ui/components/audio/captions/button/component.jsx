import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Service from '/imports/ui/components/audio/captions/service';
import Styled from './styles';

const intlMessages = defineMessages({
  start: {
    id: 'app.audio.captions.button.start',
    description: 'Start audio captions',
  },
  stop: {
    id: 'app.audio.captions.button.stop',
    description: 'Stop audio captions',
  },
});

const CaptionsButton = ({
  intl,
  active,
  enabled,
}) => {
  const onClick = () => Service.setAudioCaptions(!active);

  if (!enabled) return null;

  return (
    <Styled.ClosedCaptionToggleButton
      icon={active ? 'closed_caption' : 'closed_caption_stop'}
      label={intl.formatMessage(active ? intlMessages.stop : intlMessages.start)}
      color={active ? 'primary' : 'default'}
      ghost={!active}
      hideLabel
      circle
      size="lg"
      onClick={onClick}
    />
  );
};

CaptionsButton.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  active: PropTypes.bool.isRequired,
  enabled: PropTypes.bool.isRequired,
};

export default injectIntl(CaptionsButton);
