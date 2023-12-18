import { check } from 'meteor/check';
import AudioCaptions from '/imports/api/audio-captions';
import Logger from '/imports/startup/server/logger';

export default async function setTranscript(meetingId, transcriptId, transcript) {
  try {
    check(meetingId, String);
    check(transcriptId, String);
    check(transcript, String);

    const selector = { meetingId };

    const modifier = {
      $set: {
        transcriptId,
        transcript,
      },
    };

    const numberAffected = await AudioCaptions.upsertAsync(selector, modifier);

    if (numberAffected) {
      Logger.debug(`Set transcriptId=${transcriptId} transcript=${transcript} meeting=${meetingId}`);
    } else {
      Logger.debug(`Upserted transcriptId=${transcriptId} transcript=${transcript} meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Setting audio captions transcript to the collection: ${err}`);
  }
}
