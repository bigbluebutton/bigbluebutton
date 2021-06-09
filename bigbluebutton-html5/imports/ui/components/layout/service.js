import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import { makeCall } from '/imports/ui/services/api';

const setMeetingLayout = newValue => makeCall('changeLayout', newValue);

const getMeetingLayout = () => {
  const meeting = Meetings.findOne(
    { meetingId: Auth.meetingID },
    { fields: { 'layout': 1 } },
  );

  return meeting.layout;
};

export default {
  setMeetingLayout,
  getMeetingLayout,
};
