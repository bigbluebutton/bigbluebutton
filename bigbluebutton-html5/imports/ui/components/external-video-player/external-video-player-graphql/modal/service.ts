import ReactPlayer from 'react-player';

const YOUTUBE_SHORTS_REGEX = new RegExp(/^(?:https?:\/\/)?(?:www\.)?(youtube\.com\/shorts)\/.+$/);
const PANOPTO_MATCH_URL = /https?:\/\/([^/]+\/Panopto)(\/Pages\/Viewer\.aspx\?id=)([-a-zA-Z0-9]+)/;

export const isUrlValid = (url: string) => {
  if (YOUTUBE_SHORTS_REGEX.test(url)) {
    const shortsUrl = url.replace('shorts/', 'watch?v=');

    return /^https.*$/.test(shortsUrl) && (ReactPlayer.canPlay(shortsUrl) || PANOPTO_MATCH_URL.test(url));
  }

  return /^https.*$/.test(url) && (ReactPlayer.canPlay(url) || PANOPTO_MATCH_URL.test(url));
};

export default {
  isUrlValid,
};
