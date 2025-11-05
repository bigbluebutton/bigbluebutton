import React from 'react';
import { useMutation } from '@apollo/client';
import { SmartMediaShare } from './component';
import { startWatching } from '../../../external-video-player/service';
import { EXTERNAL_VIDEO_START } from '/imports/ui/components/external-video-player/mutations';

const SmartMediaShareContainer = (props) => {
  const [startExternalVideoMutation] = useMutation(EXTERNAL_VIDEO_START);

  return (
    <SmartMediaShare {...{
      startWatching: startWatching(startExternalVideoMutation),
      ...props,
    }}
    />
  );
};

export default SmartMediaShareContainer;
