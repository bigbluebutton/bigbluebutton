import ReactPlayer from 'react-player';

const YOUTUBE_SHORTS_REGEX = new RegExp(/^(?:https?:\/\/)?(?:www\.)?(youtube\.com\/shorts)\/.+$/);
const PANOPTO_MATCH_URL = /https?:\/\/([^/]+\/Panopto)(\/Pages\/Viewer\.aspx\?id=)([-a-zA-Z0-9]+)/;

const DAILYMOTION_MATCH_URL = /https?:\/\/(?:www\.)?dailymotion\.com\/video\/[a-zA-Z0-9]+(?:\?[^\s]*)?/g;

export const isUrlValid = (url: string) => {
  if (YOUTUBE_SHORTS_REGEX.test(url)) {
    const shortsUrl = url.replace('shorts/', 'watch?v=');

    return /^https.*$/.test(shortsUrl) && (ReactPlayer.canPlay(shortsUrl) || PANOPTO_MATCH_URL.test(url));
  }

  if (DAILYMOTION_MATCH_URL.test(url)) {
    return false; // Dailymotion is not supported by react-player https://github.com/cookpete/react-player/issues/1772
  }

  return /^https.*$/.test(url) && (ReactPlayer.canPlay(url) || PANOPTO_MATCH_URL.test(url));
};

export default {
  isUrlValid,
};
