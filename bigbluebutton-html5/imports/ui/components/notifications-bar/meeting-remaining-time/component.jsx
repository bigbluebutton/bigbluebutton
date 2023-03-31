import React from 'react';

const MeetingRemainingTime = (props) => (
  <span data-test="timeRemaining">
    { props.children }
  </span>
);

export default MeetingRemainingTime;
