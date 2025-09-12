import ReactPlayer from 'react-player';

const YOUTUBE_SHORTS_REGEX = /^(?:https?:\/\/)?(?:www\.)?(youtube\.com\/shorts)\/.+$/;
const PANOPTO_MATCH_URL = /https?:\/\/([^/]+\/Panopto)(\/Pages\/Viewer\.aspx\?id=)([-a-zA-Z0-9]+)/;
const DAILYMOTION_MATCH_URL = /https?:\/\/(?:www\.)?dailymotion\.com\/video\/[a-zA-Z0-9]+(?:\?[^\s]*)?/g;

const getAllowedExtensions = (): string[] => {
  return (
    window?.meetingClientSettings?.public?.externalVideoPlayer?.allowedFileFormats || []
  );
};

const getFileExtension = (pathname: string): string => {
  const match = pathname.match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toLowerCase() : '';
};

export const isUrlValid = (url: string) => {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch (e) {
    return false; // Invalid URL
  }

  const pathname = parsed.pathname.toLowerCase();
  const extension = getFileExtension(pathname);
  const allowedExtensions = getAllowedExtensions();

  // Check if the extension is in the allowed list
  if (extension && !allowedExtensions.includes(extension)) {
    return false;
  }

  if (YOUTUBE_SHORTS_REGEX.test(url)) {
    const shortsUrl = url.replace('shorts/', 'watch?v=');
    return /^https.*$/.test(shortsUrl) && (ReactPlayer.canPlay(shortsUrl) || PANOPTO_MATCH_URL.test(url));
  }

  if (DAILYMOTION_MATCH_URL.test(url)) {
    return false; // Dailymotion is not supported
  }

  return /^https.*$/.test(url) && (ReactPlayer.canPlay(url) || PANOPTO_MATCH_URL.test(url));
};

export default {
  isUrlValid,
};
