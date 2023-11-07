import setTranscript from '/imports/api/audio-captions/server/modifiers/setTranscript';
import updatePad from '/imports/api/pads/server/methods/updatePad';
import Users from '/imports/api/users';

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
    const datetime = new Date(Date.now());
    const userSpoke = `\n ${user.name} (${("00" + datetime.getHours()).substr(-2,2)}:${datetime.getMinutes()}:${("00" + datetime.getSeconds()).substr(-2,2)}): ${transcript}`;
    updatePad(meetingId, userId, 'en', userSpoke);
  }

  await setTranscript(userId, meetingId, transcriptId, transcript, locale);
}
