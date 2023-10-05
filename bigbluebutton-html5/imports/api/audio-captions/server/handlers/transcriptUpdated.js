import setTranscript from '/imports/api/audio-captions/server/modifiers/setTranscript';

export default async function transcriptUpdated({ header, body }) {
  const { meetingId, userId } = header;

  const {
    transcriptId,
    transcript,
    locale,
  } = body;

  await setTranscript(userId, meetingId, transcriptId, transcript, locale);
}
