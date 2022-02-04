import { check } from 'meteor/check';
import Captions from '/imports/api/captions';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';
import setTranscript from '/imports/api/captions/server/modifiers/setTranscript';
import updatePad from '/imports/api/pads/server/methods/updatePad';

export default function pushSpeechTranscript(locale, transcript, type) {
  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);
    check(locale, String);
    check(transcript, String);
    check(type, String);

    const captions = Captions.findOne({
      meetingId,
      ownerId: requesterUserId,
      locale,
      dictating: true,
    });

    if (captions) {
      if (type === 'final') {
        const text = `\n${transcript}`;
        updatePad(meetingId, requesterUserId, locale, text);
      }

      setTranscript(meetingId, locale, transcript);
    }
  } catch (err) {
    Logger.error(`Exception while invoking method pushSpeechTranscript ${err.stack}`);
  }
}
