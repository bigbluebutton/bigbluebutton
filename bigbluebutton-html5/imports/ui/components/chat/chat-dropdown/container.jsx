import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/api/meetings';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';
import ChatDropdown from './component';

const ChatDropdownContainer = ({ ...props }) => {
  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;

  return <ChatDropdown {...props} users={users[Auth.meetingID]} />;
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
