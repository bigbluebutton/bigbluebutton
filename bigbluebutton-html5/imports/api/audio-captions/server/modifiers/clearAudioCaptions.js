import AudioCaptions from '/imports/api/audio-captions';
import Logger from '/imports/startup/server/logger';

export default async function clearAudioCaptions(meetingId) {
  if (meetingId) {
    try {
      const numberAffected = await AudioCaptions.removeAsync({ meetingId });

      if (numberAffected) {
        Logger.info(`Cleared AudioCaptions (${meetingId})`);
      }
    } catch (err) {
      Logger.error(`Error on clearing audio captions (${meetingId}). ${err}`);
    }
  } else {
    try {
      const numberAffected = await AudioCaptions.removeAsync({});

      if (numberAffected) {
        Logger.info('Cleared AudioCaptions (all)');
      }
    } catch (err) {
      Logger.error(`Error on clearing audio captions (all). ${err}`);
    }
  }
}
