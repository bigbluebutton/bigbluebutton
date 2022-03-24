import { Meteor } from 'meteor/meteor';
import AudioCaptions from '/imports/api/audio-captions';
import Auth from '/imports/ui/services/auth';

const CAPTIONS_CONFIG = Meteor.settings.public.captions;
const LINE_BREAK = '\n';

const formatCaptionsText = (text) => {
  const splitText = text.split(LINE_BREAK);
  const filteredText = splitText.filter((line, index) => {
    const lastLine = index === (splitText.length - 1);
    const emptyLine = line.length === 0;

    return (!emptyLine || lastLine);
  });

  while (filteredText.length > CAPTIONS_CONFIG.lines) filteredText.shift();

  return filteredText.join(LINE_BREAK);
};

const getAudioCaptionsData = () => {
  const audioCaptions = AudioCaptions.findOne({ meetingId: Auth.meetingID });

  const data = audioCaptions ? audioCaptions.transcript : '';

  return formatCaptionsText(data);
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
