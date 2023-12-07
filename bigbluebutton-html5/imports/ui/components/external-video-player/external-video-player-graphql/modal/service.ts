import ReactPlayer from 'react-player';
import { makeCall } from '/imports/ui/services/api';

const YOUTUBE_SHORTS_REGEX = new RegExp(/^(?:https?:\/\/)?(?:www\.)?(youtube\.com\/shorts)\/.+$/);
const PANOPTO_MATCH_URL = /https?:\/\/([^/]+\/Panopto)(\/Pages\/Viewer\.aspx\?id=)([-a-zA-Z0-9]+)/;

export const stopWatching = () => {
  makeCall('stopWatchingExternalVideo');
};

export const startWatching = (url: string) => {
  let externalVideoUrl = url;

  if (YOUTUBE_SHORTS_REGEX.test(url)) {
    const shortsUrl = url.replace('shorts/', 'watch?v=');
    externalVideoUrl = shortsUrl;
  } else if (PANOPTO_MATCH_URL.test(url)) {
    const m = url.match(PANOPTO_MATCH_URL);
    if (m && m.length >= 4) {
      externalVideoUrl = `https://${m[1]}/Podcast/Social/${m[3]}.mp4`;
    }
  }

  makeCall('startWatchingExternalVideo', externalVideoUrl);
};

export const isUrlValid = (url: string) => {
  if (YOUTUBE_SHORTS_REGEX.test(url)) {
    const shortsUrl = url.replace('shorts/', 'watch?v=');

    return /^https.*$/.test(shortsUrl) && (ReactPlayer.canPlay(shortsUrl) || PANOPTO_MATCH_URL.test(url));
  }

  return /^https.*$/.test(url) && (ReactPlayer.canPlay(url) || PANOPTO_MATCH_URL.test(url));
};

export default {
  stopWatching,
  startWatching,
};
