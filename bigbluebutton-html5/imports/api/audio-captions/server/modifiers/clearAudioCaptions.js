import AudioCaptions from '/imports/api/audio-captions';
import Logger from '/imports/startup/server/logger';

export default function clearAudioCaptions(meetingId) {
  if (meetingId) {
    try {
      const numberAffected = AudioCaptions.remove({ meetingId });

      if (numberAffected) {
        Logger.info(`Cleared AudioCaptions (${meetingId})`);
      }
    } catch (err) {
      Logger.error(`Error on clearing audio captions (${meetingId}). ${err}`);
    }
  } else {
    try {
      const numberAffected = AudioCaptions.remove({});

      if (numberAffected) {
        Logger.info('Cleared AudioCaptions (all)');
      }
    } catch (err) {
      Logger.error(`Error on clearing audio captions (all). ${err}`);
    }
  }
}
