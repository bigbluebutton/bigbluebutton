import Timer from '/imports/api/timer';
import Logger from '/imports/startup/server/logger';

export default function clearTimer(meetingId) {
  if (meetingId) {
    return Timer.remove({ meetingId }, () => {
      Logger.info(`Cleared Timer (${meetingId})`);
    });
  }

  return Timer.remove({}, () => {
    Logger.info('Cleared Timer (all)');
  });
}
