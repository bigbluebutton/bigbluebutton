import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/api/meetings';
import ChatDropdown from './component';
import { layoutSelect } from '../../layout/context';

const ChatDropdownContainer = ({ ...props }) => {
  const isRTL = layoutSelect((i) => i.isRTL);

  return <ChatDropdown {...{ isRTL, ...props }} />;
};

export default withTracker(() => {
  const getMeetingName = () => {
    const m = Meetings.findOne({ meetingId: Auth.meetingID },
      { fields: { 'meetingProp.name': 1 } });
    return m.meetingProp.name;
  };

  return {
    meetingName: getMeetingName(),
  };
})(ChatDropdownContainer);
