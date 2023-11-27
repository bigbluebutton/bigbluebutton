import React from 'react';
import PropTypes from 'prop-types';
import Styled from './styles';
import { makeCall } from '/imports/ui/services/api';

// Set the logout code to 680 because it's not a real code and can be matched on the other side
const LOGOUT_CODE = '680';

const propTypes = {
  label: PropTypes.string.isRequired,
};

const LeaveMeetingButton = ({ label }) => {
  const leaveSession = () => {
    makeCall('userLeftMeeting');
    // we don't check askForFeedbackOnLogout here,
    // it is checked in meeting-ended component
    Session.set('codeError', LOGOUT_CODE);
  };

  return (
    <Styled.LeaveButton
      tooltipLabel={label}
      color="danger"
      size="lg"
      onClick={() => leaveSession()}
      icon="logout"
    />
  );
};

LeaveMeetingButton.propTypes = propTypes;

export default LeaveMeetingButton;
