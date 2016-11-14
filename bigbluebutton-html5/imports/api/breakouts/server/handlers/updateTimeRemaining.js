import Breakouts from '/imports/api/breakouts';
import Logger from '/imports/startup/server/logger';

export default function updateTimeRemaining({ payload }) {
  console.log('updateTimeRemaining', payload);
  const selector = {
    parentMeetingId: payload.meetingId,
  };

  const modifier = {
    $set: {
      timeRemaining: payload.timeRemaining,
    },
  };

  Breakouts.update(selector, modifier, (err, numChanged) => console.log(err, numChanged));
}
