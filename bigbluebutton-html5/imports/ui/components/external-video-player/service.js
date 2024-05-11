
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

// Convert state (Number) to playing (Boolean)
const getPlayingState = (state) => {
  if (state === 1) return true;

  return false;
};

export {
  isUrlValid,
  getPlayingState,
};
