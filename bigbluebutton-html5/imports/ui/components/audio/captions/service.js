const getAudioCaptions = () => Session.get('audioCaptions') || false;

const setAudioCaptions = (value) => Session.set('audioCaptions', value);

export default {
  getAudioCaptions,
  setAudioCaptions,
};
