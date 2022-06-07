import { check } from 'meteor/check';
import meetingHasEnded from '../modifiers/meetingHasEnded';
import Meetings from '/imports/api/meetings';
import Breakouts from '/imports/api/breakouts';
import Logger from '/imports/startup/server/logger';

export default function handleMeetingEnd({ header, body }) {
  check(body, Object);
  const { meetingId, reason } = body;
  check(meetingId, String);

  check(header, Object);
  const { userId } = header;
  check(userId, String);

  const cb = (err, num, meetingType) => {
    if (err) {
      Logger.error(`${meetingType} ending error: ${err}`);
      return;
    }
    if (num) {
      Meteor.setTimeout(() => { meetingHasEnded(meetingId); }, 10000);
    }
  };

  Meetings.find({ meetingId }).forEach((doc) => {
    Meetings.update({ meetingId },
      {
        $set: {
          meetingEnded: true,
          meetingEndedBy: userId,
          meetingEndedReason: reason,
          learningDashboardAccessToken: doc.password.learningDashboardAccessToken,
        },
      },
      (err, num) => { cb(err, num, 'Meeting'); });
  });

  Breakouts.update({ parentMeetingId: meetingId },
    { $set: { meetingEnded: true } },
    (err, num) => { cb(err, num, 'Breakout'); });
}
