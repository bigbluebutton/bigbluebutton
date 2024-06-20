import AudioCaptions from '/imports/api/audio-captions';
import Auth from '/imports/ui/services/auth';

const CAPTIONS_CONFIG = Meteor.settings.public.captions;
const CAPTIONS_ALWAYS_VISIBLE = Meteor.settings.public.app.audioCaptions.alwaysVisible;
const CHARACTERS_PER_LINE = CAPTIONS_CONFIG.lineLimit;
const LINES_PER_MESSAGE = CAPTIONS_CONFIG.lines;
const CAPTION_TIME = CAPTIONS_CONFIG.time;
const CAPTION_LIMIT = CAPTIONS_CONFIG.captionLimit;

function splitTranscript(obj) {
  const transcripts = [];
  const words = obj.transcript.split(' ');

  let currentLine = '';
  let result = '';

  for (const word of words) {
    if ((currentLine + word).length <= CHARACTERS_PER_LINE) {
      currentLine += word + ' ';
    } else {
      result += currentLine.trim() + '\n';
      currentLine = word + ' ';
    }

    if (result.split('\n').length > LINES_PER_MESSAGE) {
      transcripts.push(result)
      result = ''
    }
  }

  if (result.length) {
    transcripts.push(result)
  }
  transcripts.push(currentLine.trim())

  return transcripts.map((t) => { return { ...obj, transcript: t} });
}

const getAudioCaptionsData = () => {
  // the correct way woulde to use { limit: CAPTION_LIMIT } but something
  // is up with this mongo query and it does not seem to work
  let audioCaptions = AudioCaptions.find({ meetingId: Auth.meetingID}, { sort: { lastUpdate: -1 } }).fetch().slice(-CAPTION_LIMIT);

  const recentEnough = (c) => (new Date().getTime()/1000 - c.lastUpdated) < CAPTIONS_CONFIG.time/1000;

  audioCaptions = audioCaptions.filter(recentEnough).map((c) => {
    const splits = splitTranscript(c);
    return splits;
  });

  return audioCaptions.flat().filter((c) => c.transcript).slice(-CAPTION_LIMIT);
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
