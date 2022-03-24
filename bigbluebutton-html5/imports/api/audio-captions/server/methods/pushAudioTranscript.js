import { check } from 'meteor/check';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';
import setTranscript from '/imports/api/audio-captions/server/modifiers/setTranscript';

export default function pushAudioTranscript(transcript, type) {
  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);
    check(transcript, String);
    check(type, String);

    setTranscript(meetingId, transcript);
  } catch (err) {
    Logger.error(`Exception while invoking method pushAudioTranscript ${err.stack}`);
  }
}
