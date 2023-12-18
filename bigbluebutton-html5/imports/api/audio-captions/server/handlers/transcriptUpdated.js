import setTranscript from '/imports/api/audio-captions/server/modifiers/setTranscript';

export default async function transcriptUpdated({ header, body }) {
  const { meetingId } = header;

  const {
    transcriptId,
    transcript,
  } = body;

  await setTranscript(meetingId, transcriptId, transcript);
}
