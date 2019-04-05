import { check } from 'meteor/check';
import meetingHasEnded from '../modifiers/meetingHasEnded';
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

  return setTimeout(() => meetingHasEnded(meetingId), 1000);
}
