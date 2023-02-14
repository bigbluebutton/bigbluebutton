import setTranscript from '/imports/api/audio-captions/server/modifiers/setTranscript';

export default function transcriptUpdated({ header, body }) {
  const {
    meetingId,
  } = header;

  const {
    transcriptId,
    transcript,
  } = body;

  setTranscript(meetingId, transcriptId, transcript);
}
