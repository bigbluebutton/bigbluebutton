import { check } from 'meteor/check';
import AudioCaptions from '/imports/api/audio-captions';
import Logger from '/imports/startup/server/logger';

export default function setTranscript(meetingId, transcript) {
  try {
    check(meetingId, String);
    check(transcript, String);

    const selector = { meetingId };

    const modifier = {
      $set: {
        transcript,
      },
    };

    const numberAffected = AudioCaptions.upsert(selector, modifier);

    if (numberAffected) {
      Logger.debug(`Set transcript=${transcript} meeting=${meetingId}`);
    } else {
      Logger.debug(`Upserted transcript=${transcript} meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Setting audio captions transcript to the collection: ${err}`);
  }
}
