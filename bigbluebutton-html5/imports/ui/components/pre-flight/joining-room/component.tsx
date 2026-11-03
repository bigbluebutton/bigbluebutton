import React, { useCallback, useEffect } from 'react';
import { defineMessages, MessageDescriptor, useIntl } from 'react-intl';
import { BBButton } from '@bigbluebutton/bbb-ui-components-react';
import Styled from '../styles';
import { usePreFlight } from '../context';
import JoinNotices, { DEVICE_PENDING_NOTICE_ID } from '../join-notices/component';

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
});

interface JoiningRoomHeaderProps {
  meetingName: string;
  clientTitle: string;
  isJoining: boolean;
  // Off when something else above the join button carries the notices (the
  // room mode panel's footer): the button points at their id.
  withNotices?: boolean;
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
  withNotices = true,
}) => {
  const intl = useIntl();

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
      {withNotices && <JoinNotices />}
    </>
  );
};

interface JoiningRoomActionsProps {
  isJoining: boolean;
  onJoin: () => void;
  // The room mode panel starts the room with the same join.
  label?: MessageDescriptor;
  // Rendered before the join button, in the same row.
  secondaryAction?: React.ReactNode;
}

export const JoiningRoomActions: React.FC<JoiningRoomActionsProps> = ({
  isJoining,
  onJoin,
  label = intlMessages.joinLabel,
  secondaryAction = null,
}) => {
  const intl = useIntl();
  const { commit, devicesPending } = usePreFlight();

  const handleJoin = useCallback(() => {
    commit();
    onJoin();
  }, [commit, onJoin]);

  return (
    <Styled.ActionsWrapper>
      {secondaryAction}
      <BBButton
        variant="primary"
        disabled={isJoining || devicesPending}
        label={intl.formatMessage(isJoining ? intlMessages.joiningLabel : label)}
        onClick={handleJoin}
        ariaDescribedBy={devicesPending ? DEVICE_PENDING_NOTICE_ID : undefined}
        dataTest="preFlightJoinButton"
      />
    </Styled.ActionsWrapper>
  );
};
