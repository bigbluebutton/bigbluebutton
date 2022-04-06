import AudioCaptions from '/imports/api/audio-captions';
import Auth from '/imports/ui/services/auth';

const getAudioCaptionsData = () => {
  const audioCaptions = AudioCaptions.findOne({ meetingId: Auth.meetingID });

  return audioCaptions ? audioCaptions.transcript : '';
};

const getAudioCaptions = () => Session.get('audioCaptions') || false;

const setAudioCaptions = (value) => Session.set('audioCaptions', value);

const hasAudioCaptions = () => {
  const audioCaptions = AudioCaptions.findOne(
    { meetingId: Auth.meetingID },
    { fields: {} },
  );

  return !!audioCaptions;
};

export default {
  getAudioCaptionsData,
  getAudioCaptions,
  setAudioCaptions,
  hasAudioCaptions,
};
