import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { BBButton } from '@bigbluebutton/bbb-ui-components-react';
import { useLocalEcho, useMuteWhileHearing } from './hooks';

const intlMessages = defineMessages({
  startHearing: {
    id: 'app.audio.startAudioFeedback',
    description: 'Start audio feedback button label',
  },
  stopHearing: {
    id: 'app.audio.stopAudioFeedback',
    description: 'Stop audio feedback button label',
  },
});

interface HearMyselfButtonProps {
  stream: MediaStream | null;
  outputDeviceId: string | null;
  /**
   * The classic audio modal starts hearing (localEchoTest.initialHearingState)
   * as it opens. Elsewhere, start silent. @default false
   */
  initialHearingState?: boolean;
  dataTest?: string;
}

/**
 * Toggles playing the microphone back on the output device. The user is muted
 * in the audio meanwhile.
 */
const HearMyselfButton: React.FC<HearMyselfButtonProps> = ({
  stream,
  outputDeviceId,
  initialHearingState = false,
  dataTest,
}) => {
  const intl = useIntl();
  const { hearing, setHearing } = useLocalEcho({ stream, outputDeviceId, initialHearingState });
  useMuteWhileHearing(hearing);

  return (
    <BBButton
      variant="subtle"
      label={intl.formatMessage(hearing ? intlMessages.stopHearing : intlMessages.startHearing)}
      onClick={() => setHearing(!hearing)}
      disabled={!stream}
      dataTest={dataTest}
    />
  );
};

export default HearMyselfButton;
