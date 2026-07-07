import React, { useRef } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Styled from './styles';
import PreFlightBody, { PreFlightBodyHandle } from './PreFlightBody';
import getFromUserSettings from '/imports/ui/services/users-settings';

const intlMessages = defineMessages({
  title: {
    id: 'app.preFlight.guestTitle',
    description: 'Green room title while waiting for approval',
  },
  subtitle: {
    id: 'app.preFlight.guestSubtitle',
    description: 'Green room subtitle',
  },
  ariaTitle: {
    id: 'app.preFlight.guestAriaTitle',
    description: 'Green room aria title',
  },
  waitingLabel: {
    id: 'app.guest.waitingForApproval',
    description: 'Waiting status text',
  },
  messageFromHost: {
    id: 'app.guest.messageFromHost',
    description: 'Label for host message',
  },
});

interface GuestPreFlightProps {
  positionMessage: string;
  hostMessage: string | null;
}

// Separate container for the guest waiting room green room. It uses safe
// defaults and never depends on the post-admission hooks (useLockContext /
// useMeeting) nor the audio bridge, since there is no AudioManager session yet.
const GuestPreFlight: React.FC<GuestPreFlightProps> = ({ positionMessage, hostMessage }) => {
  const intl = useIntl();
  const bodyRef = useRef<PreFlightBodyHandle>(null);

  const APP_CONFIG = window.meetingClientSettings.public.app;
  const KURENTO_CONFIG = window.meetingClientSettings.public.kurento;
  const { enabled: localEchoEnabled } = window.meetingClientSettings.public.media.localEchoTest;

  const enableVideo = getFromUserSettings('bbb_enable_video', KURENTO_CONFIG.enableVideo);
  const forceListenOnly = getFromUserSettings('bbb_force_listen_only', APP_CONFIG.forceListenOnly);

  const hasHostMessage = !!hostMessage && hostMessage.length > 0;

  const renderFooter = () => (
    <Styled.StatusBanner data-test="preFlightWaitingStatus">
      <Styled.StatusHeadline>
        <Styled.WaitingDot />
        <span aria-live="polite">{intl.formatMessage(intlMessages.waitingLabel)}</span>
      </Styled.StatusHeadline>
      {positionMessage ? <Styled.WaitingPosition aria-live="polite">{positionMessage}</Styled.WaitingPosition> : null}
      {hasHostMessage && (
        <Styled.HostMessage>
          <Styled.HostMessageLabel>{intl.formatMessage(intlMessages.messageFromHost)}</Styled.HostMessageLabel>
          <span
            aria-live="polite"
            data-test="guestMessage"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: hostMessage as string }}
          />
        </Styled.HostMessage>
      )}
    </Styled.StatusBanner>
  );

  return (
    <Styled.GuestRoomContainer>
      <Styled.GuestRoomCard
        aria-label={intl.formatMessage(intlMessages.ariaTitle)}
        data-test="preFlightGuestRoom"
      >
        <Styled.Header>
          <Styled.Title>{intl.formatMessage(intlMessages.title)}</Styled.Title>
          <Styled.Subtitle>{intl.formatMessage(intlMessages.subtitle)}</Styled.Subtitle>
        </Styled.Header>
        <PreFlightBody
          ref={bodyRef}
          useAudioManager={false}
          persistDevices
          micDisabled={!!forceListenOnly}
          showCamera={!!enableVideo}
          isCamLocked={false}
          supportsTransparentListenOnly={false}
          localEchoEnabled={!!localEchoEnabled}
          enableCameraShareToggle={false}
          shareOnJoinDefault={false}
          renderFooter={renderFooter}
        />
      </Styled.GuestRoomCard>
    </Styled.GuestRoomContainer>
  );
};

export default GuestPreFlight;
