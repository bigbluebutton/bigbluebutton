import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Styled from '../styles';
import { usePreFlight } from '../context';

const intlMessages = defineMessages({
  withoutAudio: {
    id: 'app.preFlight.joiningWithoutAudio',
    description: 'Shown above the join button after the user passed over a denied microphone',
  },
  devicePending: {
    id: 'app.preFlight.devicePermissionPending',
    description: 'Shown above the join button while the browser has yet to answer for a device',
  },
});

// Describes the join button while it is held, so one page-wide id will do.
export const DEVICE_PENDING_NOTICE_ID = 'preFlightDevicePendingNotice';

/**
 * Conditions of the join, rendered by whatever stands above the join button:
 * the join step's header, or the room mode panel's footer. Exactly one of them
 * renders it, as the button points at its id.
 */
const JoinNotices: React.FC = () => {
  const intl = useIntl();
  const { joiningWithoutAudio, devicesPending } = usePreFlight();

  return (
    <>
      {joiningWithoutAudio && (
        <Styled.JoinNotice aria-live="polite" data-test="preFlightJoiningWithoutAudio">
          {intl.formatMessage(intlMessages.withoutAudio)}
        </Styled.JoinNotice>
      )}
      {devicesPending && (
        <Styled.JoinNotice
          id={DEVICE_PENDING_NOTICE_ID}
          aria-live="polite"
          data-test="preFlightDevicePending"
        >
          {intl.formatMessage(intlMessages.devicePending)}
        </Styled.JoinNotice>
      )}
    </>
  );
};

export default JoinNotices;
