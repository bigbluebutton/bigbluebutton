import Polls from '/imports/api/polls';
import Logger from '/imports/startup/server/logger';

export default function clearPolls(meetingId) {
  if (meetingId) {
    try {
      const numberAffected = Polls.remove({ meetingId });

      if (numberAffected) {
        Logger.info(`Cleared Polls (${meetingId})`);
      }
    } catch (err) {
      Logger.info(`Error on clearing Polls (${meetingId}). ${err}`);
    }
  } else {
    try {
      const numberAffected = Polls.remove({});

      if (numberAffected) {
        Logger.info('Cleared Polls (all)');
      }
    } catch (err) {
      Logger.info(`Error on clearing Polls (all). ${err}`);
    }
  }
}
