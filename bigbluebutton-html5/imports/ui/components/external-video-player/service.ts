import ReactPlayer from 'react-player';

import { Panopto } from './custom-players/panopto';
import { ExternalVideo } from '/imports/ui/Types/meeting';

const YOUTUBE_SHORTS_REGEX = new RegExp(/^(?:https?:\/\/)?(?:www\.)?(youtube\.com\/shorts)\/.+$/);

const isUrlValid = (url: string) => {
  if (YOUTUBE_SHORTS_REGEX.test(url)) {
    const shortsUrl = url.replace('shorts/', 'watch?v=');

    return /^https.*$/.test(shortsUrl) && (ReactPlayer.canPlay(shortsUrl) || Panopto.canPlay(shortsUrl));
  }

  return /^https.*$/.test(url) && (ReactPlayer.canPlay(url) || Panopto.canPlay(url));
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
};
