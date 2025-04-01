import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Styled from './styles';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  stream: PropTypes.shape({
    active: PropTypes.bool,
    id: PropTypes.string,
  }),
  initialHearingState: PropTypes.bool,
  playEchoStream: PropTypes.func.isRequired,
  deattachEchoStream: PropTypes.func.isRequired,
  shouldUseRTCLoopback: PropTypes.func.isRequired,
  createAudioRTCLoopback: PropTypes.func.isRequired,
  outputDeviceId: PropTypes.string,
  setAudioSink: PropTypes.func.isRequired,
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
  playEchoStream,
  deattachEchoStream,
  shouldUseRTCLoopback,
  createAudioRTCLoopback,
  outputDeviceId,
  setAudioSink,
}) => {
  const loopbackAgent = useRef(null);
  const [hearing, setHearing] = useState(initialHearingState);
  const Settings = getSettingsSingletonInstance();
  const { animations } = Settings.application;
  const icon = hearing ? 'no_audio' : 'listen';
  const label = hearing ? intlMessages.stopAudioFeedbackLabel : intlMessages.startAudioFeedback;

  const applyHearingState = (_stream) => {
    if (hearing) {
      setAudioSink(outputDeviceId);
      playEchoStream(_stream, loopbackAgent.current);
    } else {
      deattachEchoStream();
    }
  };

  const cleanup = () => {
    if (loopbackAgent.current) loopbackAgent.current.stop();
    deattachEchoStream();
  };

  useEffect(() => {
    if (shouldUseRTCLoopback()) {
      loopbackAgent.current = createAudioRTCLoopback();
    }
    return cleanup;
  }, []);

  useEffect(() => {
    applyHearingState(stream);
  }, [stream, hearing]);

  useEffect(() => {
    if (outputDeviceId) setAudioSink(outputDeviceId);
  }, [outputDeviceId]);

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
