import ReactPlayer from 'react-player';
import { MutationFunction } from '@apollo/client';
import { ExternalVideo } from '/imports/ui/Types/meeting';

const YOUTUBE_SHORTS_REGEX = new RegExp(/^(?:https?:\/\/)?(?:www\.)?(youtube\.com\/shorts)\/.+$/);
const DAILYMOTION_MATCH_URL = /https?:\/\/(?:www\.)?dailymotion\.com\/video\/[a-zA-Z0-9]+(?:\?[^\s]*)?/g;
const YOUTUBE_REGEX = new RegExp(/^(?:https?:\/\/)?(?:www\.)?(youtube\.com|youtu.be)\/.+$/);

const startWatching = (startExternalVideoMutation: MutationFunction) => {
  return (url: string) => {
    let externalVideoUrl = url;

    if (YOUTUBE_SHORTS_REGEX.test(url)) {
      const shortsUrl = url.replace('shorts/', 'watch?v=');
      externalVideoUrl = shortsUrl;
    }

    if (YOUTUBE_REGEX.test(externalVideoUrl)) {
      const YTUrl = new URL(externalVideoUrl);
      YTUrl.searchParams.delete('list');
      YTUrl.searchParams.delete('index');
      externalVideoUrl = YTUrl.toString();
    }

    startExternalVideoMutation({ variables: { externalVideoUrl } });
  };
};

const isUrlValid = (url: string) => {
  if (YOUTUBE_SHORTS_REGEX.test(url)) {
    const shortsUrl = url.replace('shorts/', 'watch?v=');

    return /^https.*$/.test(shortsUrl) && ReactPlayer.canPlay(shortsUrl);
  }

  if (DAILYMOTION_MATCH_URL.test(url)) {
    return false; // Dailymotion is not supported by react-player https://github.com/cookpete/react-player/issues/1772
  }

  return /^https.*$/.test(url) && ReactPlayer.canPlay(url);
};

// Convert state (Number) to playing (Boolean)
const getPlayingState = (state: number) => {
  if (state === 1) return true;

  return false;
};

const calculateCurrentTime = (timeSync: number, externalVideoProps?: ExternalVideo) => {
  const playerCurrentTime = externalVideoProps?.playerCurrentTime ?? 0;

  const playerUpdatedAt = externalVideoProps?.updatedAt ?? Date.now();
  const playerUpdatedAtDate = new Date(playerUpdatedAt);
  const currentDate = new Date(Date.now() + (timeSync ?? 0));
  const isPaused = !externalVideoProps?.playerPlaying;
  const currentTime = isPaused
    ? playerCurrentTime
    : ((currentDate.getTime() - playerUpdatedAtDate.getTime()) / 1000)
    + (playerCurrentTime);

  return currentTime;
};

export {
  isUrlValid,
  getPlayingState,
  calculateCurrentTime,
  startWatching,
};
