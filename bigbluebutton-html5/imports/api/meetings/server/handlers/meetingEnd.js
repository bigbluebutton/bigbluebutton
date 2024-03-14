import { check } from 'meteor/check';
import meetingHasEnded from '../modifiers/meetingHasEnded';
import Meetings from '/imports/api/meetings';
import Breakouts from '/imports/api/breakouts';
import Logger from '/imports/startup/server/logger';

export default async function handleMeetingEnd({ header, body }) {
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

  await Meetings.find({ meetingId }).forEachAsync(async (doc) => {
    let num = 0;
    let err = null;
    try {
      num = await Meetings.updateAsync({ meetingId },
        {
          $set: {
            meetingEnded: true,
            meetingEndedBy: userId,
            meetingEndedReason: reason,
            learningDashboardAccessToken: doc.password.learningDashboardAccessToken,
          },
        });
    } catch (error) {
      err = error;
    }
    cb(err, num, 'Meeting');
  });

  let num = 0;
  let err = null;
  try {
    num = await Breakouts.update(
      { parentMeetingId: meetingId },
      { $set: { meetingEnded: true } },
    );
  } catch (error) {
    err = error;
  }
  cb(err, num, 'Breakout');
}
