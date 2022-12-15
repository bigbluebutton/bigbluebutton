import setTranscript from '/imports/api/audio-captions/server/modifiers/setTranscript';
import updatePad from '/imports/api/pads/server/methods/updatePad';
import Users from '/imports/api/users';

export default function transcriptUpdated({ header, body }) {
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
    const datetime = new Date(Date.now());
    const userSpoke = `\n ${user.name} (${datetime.getHours()}:${datetime.getMinutes()}): ${transcript}`;
    updatePad(meetingId, userId, 'en', userSpoke);
  }

  setTranscript(meetingId, transcriptId, transcript);
}
