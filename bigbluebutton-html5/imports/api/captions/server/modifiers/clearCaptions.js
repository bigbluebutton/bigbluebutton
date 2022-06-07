import Captions from '/imports/api/captions';
import Logger from '/imports/startup/server/logger';

export default function clearCaptions(meetingId) {
  if (meetingId) {
    try {
      const numberAffected = Captions.remove({ meetingId });

      if (numberAffected) {
        Logger.info(`Cleared Captions (${meetingId})`);
      }
    } catch (err) {
      Logger.error(`Error on clearing captions (${meetingId}). ${err}`);
    }
  } else {
    try {
      const numberAffected = Captions.remove({});

      if (numberAffected) {
        Logger.info('Cleared Captions (all)');
      }
    } catch (err) {
      Logger.error(`Error on clearing captions (all). ${err}`);
    }
  }
}
