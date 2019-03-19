import { check } from 'meteor/check';
import removeMeeting from '../modifiers/removeMeeting';
import Meetings from '/imports/api/meetings';
import Breakouts from '/imports/api/breakouts';

export default function handleMeetingEnd({ body }, meetingId) {
  check(meetingId, String);

  Meetings.update({
    meetingId,
  }, {
    $set: {
      meetingEnded: true,
    },
  });

  Breakouts.update({
    parentMeetingId: meetingId,
  }, {
    $set: {
      meetingEnded: true,
    },
  });

  return setTimeout(() => removeMeeting(meetingId), 10000);
}
