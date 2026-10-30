import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Styled from './styles';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import { useLocalEcho } from '/imports/ui/components/media-setup/audio-test/hooks';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  stream: PropTypes.shape({
    active: PropTypes.bool,
    id: PropTypes.string,
  }),
  initialHearingState: PropTypes.bool,
  outputDeviceId: PropTypes.string,
};

const intlMessages = defineMessages({
  stopAudioFeedbackLabel: {
    id: 'app.audio.stopAudioFeedback',
    description: 'Stop audio feedback button label',
  },
  startAudioFeedback: {
    id: 'app.audio.startAudioFeedback',
    description: 'Start audio feedback button label',
  },
});

const LocalEcho = ({
  intl,
  stream = null,
  initialHearingState = false,
  outputDeviceId,
}) => {
  const { hearing, setHearing } = useLocalEcho({ stream, outputDeviceId, initialHearingState });
  const Settings = getSettingsSingletonInstance();
  const { animations } = Settings.application;
  const icon = hearing ? 'no_audio' : 'listen';
  const label = hearing ? intlMessages.stopAudioFeedbackLabel : intlMessages.startAudioFeedback;

  return (
    <Styled.LocalEchoTestButton
      data-test={hearing ? 'stopHearingButton' : 'testSpeakerButton'}
      label={intl.formatMessage(label)}
      icon={icon}
      size="md"
      color="primary"
      onClick={() => setHearing(!hearing)}
      animations={animations}
    />
  );
};

LocalEcho.propTypes = propTypes;

export default injectIntl(React.memo(LocalEcho));
