import React from 'react';
import { useIntl } from 'react-intl';
import Styled from './styles';
import useGuestWaitState, {
  GUEST_STATUSES,
  GuestWaitStateProps,
  intlMessages,
} from './hooks/useGuestWaitState';

export { GUEST_STATUSES };

const GuestWait: React.FC<GuestWaitStateProps> = (props) => {
  const intl = useIntl();
  const {
    message,
    positionMessage,
    animate,
    hasCustomMessage,
    showPositionInWaitingQueue,
  } = useGuestWaitState(props);

  return (
    <Styled.Container>
      <Styled.Content id="content">
        <Styled.Heading id="heading">{intl.formatMessage(intlMessages.windowTitle)}</Styled.Heading>
        {showPositionInWaitingQueue && (
          <Styled.Position id="positionInWaitingQueue">
            <p aria-live="polite">{positionMessage}</p>
          </Styled.Position>
        )}
        {hasCustomMessage && (
          <Styled.MessageContainer>
            <Styled.MessageLabel>
              {intl.formatMessage(intlMessages.messageFromHost)}
            </Styled.MessageLabel>
            <Styled.MessageText
              aria-live="polite"
              data-test="guestMessage"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: message }}
            />
          </Styled.MessageContainer>
        )}
        {!hasCustomMessage && (
          <p
            aria-live="polite"
            data-test="guestMessage"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: message }}
          />
        )}
        {animate && (
          <Styled.WaitingIndicator>
            <Styled.WaitingDot />
            <span>{intl.formatMessage(intlMessages.waitingForApproval)}</span>
          </Styled.WaitingIndicator>
        )}
      </Styled.Content>
    </Styled.Container>
  );
};

export default GuestWait;
