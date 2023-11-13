import AudioCaptions from '/imports/api/audio-captions';
import Auth from '/imports/ui/services/auth';

const CAPTIONS_ALWAYS_VISIBLE = Meteor.settings.public.app.audioCaptions.alwaysVisible;

const getAudioCaptionsData = () => {
  const audioCaptions = AudioCaptions.findOne({ meetingId: Auth.meetingID });

  if (audioCaptions) {
    return {
      transcriptId: audioCaptions.transcriptId,
      transcript: audioCaptions.transcript,
    };
  }

  return {
    transcriptId: '',
    transcript: '',
  };
};

const getAudioCaptions = () => Session.get('audioCaptions') || false;

const setAudioCaptions = (value) => Session.set('audioCaptions', value);

const hasAudioCaptions = () => {
  const audioCaptions = AudioCaptions.findOne(
    { meetingId: Auth.meetingID },
    { fields: {} },
  );

  return CAPTIONS_ALWAYS_VISIBLE || !!audioCaptions;
};

export default {
  getAudioCaptionsData,
  getAudioCaptions,
  setAudioCaptions,
  hasAudioCaptions,
};
