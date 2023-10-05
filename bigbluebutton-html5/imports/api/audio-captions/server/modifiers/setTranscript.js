import { check } from 'meteor/check';
import AudioCaptions from '/imports/api/audio-captions';
import Users from '/imports/api/users';
import Logger from '/imports/startup/server/logger';

export default async function setTranscript(userId, meetingId, transcriptId, transcript, locale) {
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

    //const user = await Users.findOneAsync({userId, meetingId});

    //if (user.speechLocale.slice(0,2) !== locale) {
    //  Logger.info("Skipping transcription for another locale", user.speechLocale, locale);
    //  return;
    //}

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
