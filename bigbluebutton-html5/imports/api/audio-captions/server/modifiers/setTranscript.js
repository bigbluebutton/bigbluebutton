import { check } from 'meteor/check';
import AudioCaptions from '/imports/api/audio-captions';
import Users from '/imports/api/users';
import Logger from '/imports/startup/server/logger';

export default async function setTranscript(userId, meetingId, transcriptId, transcript, locale) {
  try {
    check(meetingId, String);
    check(transcriptId, String);
    check(transcript, String);

    const selector = { meetingId, transcriptId };

    const modifier = {
      $set: {
        transcript,
        lastUpdated: Math.floor(new Date().getTime()/1000),
        locale,
      },
    };

    const numberAffected = await AudioCaptions.upsertAsync(selector, modifier);

    if (numberAffected) {
      Logger.debug(`Set transcriptId=${transcriptId} transcript=${transcript} meeting=${meetingId} locale=${locale}`);
    } else {
      Logger.debug(`Upserted transcriptId=${transcriptId} transcript=${transcript} meeting=${meetingId} locale=${locale}`);
    }
  } catch (err) {
    Logger.error(`Setting audio captions transcript to the collection: ${err}`);
  }
}
