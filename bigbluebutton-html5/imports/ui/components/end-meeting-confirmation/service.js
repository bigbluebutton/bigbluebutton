import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/api/meetings';

const getMeetingTitle = () => {
  const meeting = Meetings.findOne({
    meetingId: Auth.meetingID,
  }, { fields: { name: 1, 'breakoutPolicies.sequence': 1 } });

  return meeting.name;
};

export default {
  getMeetingTitle,
};
