import setTranscript from '/imports/api/audio-captions/server/modifiers/setTranscript';
import updateTranscriptPad from '/imports/api/pads/server/methods/updateTranscriptPad';
import Users from '/imports/api/users';

const TRANSCRIPTION_DEFAULT_PAD = Meteor.settings.public.captions.defaultPad;

const formatDate = (dStr) => {
  return ("00" + dStr).substr(-2,2);
};

export default async function transcriptUpdated({ header, body }) {
  const {
    meetingId,
    userId,
  } = header;

  const {
    transcriptId,
    transcript,
    locale,
    result,
  } = body;

  if (result) {
    const user = Users.findOne({ userId }, { fields: { name: 1 } });
    const userName = user?.name || '??';

    const dt = new Date(Date.now());
    const hours = formatDate(dt.getHours()),
          minutes = formatDate(dt.getMinutes()),
          seconds = formatDate(dt.getSeconds());

    const userSpoke = `\n ${userName} (${hours}:${minutes}:${seconds}): ${transcript}`;
    updateTranscriptPad(meetingId, userId, TRANSCRIPTION_DEFAULT_PAD, userSpoke);
  }

  await setTranscript(userId, meetingId, transcriptId, transcript, locale);
}
