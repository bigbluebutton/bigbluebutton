import React, { useCallback, useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { BBButton } from '@bigbluebutton/bbb-ui-components-react';
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
  withoutAudio: {
    id: 'app.preFlight.joiningWithoutAudio',
    description: 'Shown above the join button after the user passed over a denied microphone',
  },
  joiningLabel: {
    id: 'app.preFlight.joiningLabel',
    description: 'Label of the join button while the join is underway',
  },
});

interface JoiningRoomHeaderProps {
  meetingName: string;
  clientTitle: string;
  isJoining: boolean;
}

/**
 * Names the session and reports the join. Kept apart from the button so the
 * heading can precede the setup panel on a phone while the button still
 * follows it - see the `header` and `actions` slots of the pre-flight.
 */
export const JoiningRoomHeader: React.FC<JoiningRoomHeaderProps> = ({
  meetingName,
  clientTitle,
  isJoining,
}) => {
  const intl = useIntl();
  const { joiningWithoutAudio } = usePreFlight();

  useEffect(() => {
    document.title = meetingName || clientTitle;
  }, [meetingName, clientTitle]);

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
      {joiningWithoutAudio && (
        <Styled.JoinNotice aria-live="polite" data-test="preFlightJoiningWithoutAudio">
          {intl.formatMessage(intlMessages.withoutAudio)}
        </Styled.JoinNotice>
      )}
    </>
  );
};

interface JoiningRoomActionsProps {
  isJoining: boolean;
  onJoin: () => void;
}

export const JoiningRoomActions: React.FC<JoiningRoomActionsProps> = ({
  isJoining,
  onJoin,
}) => {
  const intl = useIntl();
  const { commit } = usePreFlight();

  const handleJoin = useCallback(() => {
    commit();
    onJoin();
  }, [commit, onJoin]);

  return (
    <Styled.ActionsWrapper>
      <BBButton
        variant="primary"
        disabled={isJoining}
        label={intl.formatMessage(isJoining ? intlMessages.joiningLabel : intlMessages.joinLabel)}
        onClick={handleJoin}
        dataTest="preFlightJoinButton"
      />
    </Styled.ActionsWrapper>
  );
};
