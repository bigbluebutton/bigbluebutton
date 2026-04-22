import React from 'react';
import { useMutation } from '@apollo/client';
import { SmartMediaShare } from './component';
import Panopto from '../../../external-video-player/custom-players/panopto';
import { EXTERNAL_VIDEO_START } from '../../../external-video-player/mutations';

const YOUTUBE_SHORTS_REGEX = new RegExp(/^(?:https?:\/\/)?(?:www\.)?(youtube\.com\/shorts)\/.+$/);

const SmartMediaShareContainer = (props) => {
  const [startExternalVideo] = useMutation(EXTERNAL_VIDEO_START);

  const startWatching = (url) => {
    let externalVideoUrl = url;

    if (YOUTUBE_SHORTS_REGEX.test(url)) {
      const shortsUrl = url.replace('shorts/', 'watch?v=');
      externalVideoUrl = shortsUrl;
    } else if (Panopto.canPlay(url)) {
      externalVideoUrl = Panopto.getSocialUrl(url);
    }

    startExternalVideo({ variables: { externalVideoUrl } });
  };

  return (
    <SmartMediaShare {...{
      startWatching,
      ...props,
    }}
    />
  );
};

export default SmartMediaShareContainer;
