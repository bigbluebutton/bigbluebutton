import React, { useCallback, useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Styled from '../styles';
import { usePreFlight } from '../context';

const intlMessages = defineMessages({
  readyDescription: {
    id: 'app.preFlight.readyDescription',
    description: 'Description shown while the user sets up before joining',
  },
  joinLabel: {
    id: 'app.preFlight.joinLabel',
    description: 'Label of the button that joins the session',
  },
  joiningLabel: {
    id: 'app.preFlight.joiningLabel',
    description: 'Label of the join button while the join is underway',
  },
  retryLabel: {
    id: 'app.preFlight.retryLabel',
    description: 'Label of the join button after a failed join',
  },
  joinFailed: {
    id: 'app.preFlight.joinFailed',
    description: 'Message shown when the join did not complete',
  },
});

interface JoiningRoomProps {
  meetingName: string;
  clientTitle: string;
  isJoining: boolean;
  hasFailed?: boolean;
  onJoin: () => void;
}

const JoiningRoom: React.FC<JoiningRoomProps> = ({
  meetingName,
  clientTitle,
  isJoining,
  hasFailed = false,
  onJoin,
}) => {
  const intl = useIntl();
  const { commit } = usePreFlight();

  useEffect(() => {
    document.title = meetingName || clientTitle;
  }, [meetingName, clientTitle]);

  const handleJoin = useCallback(() => {
    commit();
    onJoin();
  }, [commit, onJoin]);

  let joinButtonLabel = intlMessages.joinLabel;
  if (isJoining) joinButtonLabel = intlMessages.joiningLabel;
  else if (hasFailed) joinButtonLabel = intlMessages.retryLabel;

  return (
    <>
      {isJoining && (
        <Styled.Spinner
          role="status"
          aria-label={intl.formatMessage(intlMessages.joiningLabel)}
          data-test="preFlightJoiningSpinner"
        />
      )}
      <Styled.Heading>{meetingName || clientTitle}</Styled.Heading>
      <Styled.Description>{intl.formatMessage(intlMessages.readyDescription)}</Styled.Description>
      {hasFailed && (
        <Styled.ErrorMessage aria-live="polite" data-test="preFlightJoinError">
          {intl.formatMessage(intlMessages.joinFailed)}
        </Styled.ErrorMessage>
      )}
      <Styled.JoinButton
        color="primary"
        autoFocus
        disabled={isJoining}
        label={intl.formatMessage(joinButtonLabel)}
        onClick={handleJoin}
        dataTest="preFlightJoinButton"
      />
    </>
  );
};

export default JoiningRoom;
