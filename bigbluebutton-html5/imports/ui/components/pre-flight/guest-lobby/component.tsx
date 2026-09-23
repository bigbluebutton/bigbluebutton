import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Styled from '../styles';
import useGuestWaitState, {
  GUEST_STATUSES,
  GuestWaitStateProps,
  intlMessages,
} from '/imports/ui/components/join-handler/guest-wait/hooks/useGuestWaitState';

const localIntlMessages = defineMessages({
  // app.guest.windowTitle carries the product name, so the card gets its own.
  guestLobbyTitle: {
    id: 'app.preFlight.guestLobbyTitle',
    description: 'Heading of the guest lobby card',
  },
});

const GuestLobby: React.FC<GuestWaitStateProps> = (props) => {
  const { guestStatus } = props;
  const intl = useIntl();
  const {
    message,
    positionMessage,
    animate,
    hasCustomMessage,
    showPositionInWaitingQueue,
  } = useGuestWaitState(props);

  const isWaiting = guestStatus === GUEST_STATUSES.WAIT;
  const showMessageCard = hasCustomMessage && isWaiting;
  const description = showMessageCard ? intl.formatMessage(intlMessages.guestWait) : message;

  return (
    <>
      {animate && (
        <Styled.Spinner
          role="status"
          aria-label={intl.formatMessage(intlMessages.waitingForApproval)}
          data-test="guestWaitSpinner"
        />
      )}
      <Styled.Heading id="heading">{intl.formatMessage(localIntlMessages.guestLobbyTitle)}</Styled.Heading>
      {showPositionInWaitingQueue && positionMessage && (
        <Styled.Position id="positionInWaitingQueue" aria-live="polite">
          {positionMessage}
        </Styled.Position>
      )}
      <Styled.Description
        aria-live="polite"
        data-test="guestMessage"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: description }}
      />
      {showMessageCard && (
        <Styled.MessageContainer>
          <Styled.MessageLabel>
            {intl.formatMessage(intlMessages.messageFromHost)}
          </Styled.MessageLabel>
          <Styled.MessageText
            aria-live="polite"
            data-test="guestLobbyMessage"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: message }}
          />
        </Styled.MessageContainer>
      )}
    </>
  );
};

export default GuestLobby;
