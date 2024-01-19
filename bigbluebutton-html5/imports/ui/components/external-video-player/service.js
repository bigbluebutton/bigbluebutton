import Auth from '/imports/ui/services/auth';

import { getStreamer } from '/imports/api/external-videos';
import ReactPlayer from 'react-player';

import Panopto from './custom-players/panopto';

const YOUTUBE_SHORTS_REGEX = new RegExp(/^(?:https?:\/\/)?(?:www\.)?(youtube\.com\/shorts)\/.+$/);

const isUrlValid = (url) => {
  if (YOUTUBE_SHORTS_REGEX.test(url)) {
    const shortsUrl = url.replace('shorts/', 'watch?v=');

    return /^https.*$/.test(shortsUrl) && (ReactPlayer.canPlay(shortsUrl) || Panopto.canPlay(shortsUrl));
  }

  return /^https.*$/.test(url) && (ReactPlayer.canPlay(url) || Panopto.canPlay(url));
};

const onMessage = (message, func) => {
  const streamer = getStreamer(Auth.meetingID);
  streamer.on(message, func);
};

const removeAllListeners = (eventType) => {
  const streamer = getStreamer(Auth.meetingID);
  streamer.removeAllListeners(eventType);
};

// Convert state (Number) to playing (Boolean)
const getPlayingState = (state) => {
  if (state === 1) return true;

  return false;
};

export {
  onMessage,
  removeAllListeners,
  isUrlValid,
  getPlayingState,
};
