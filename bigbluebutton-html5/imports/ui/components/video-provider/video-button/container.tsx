import React, { useContext } from 'react';
import { CameraSettingsDropdownInterface } from 'bigbluebutton-html-plugin-sdk';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import {
  useDisableReason, useExitVideo, useHasVideoStream, useStatus, useStopVideo,
} from '/imports/ui/components/video-provider/hooks';
import JoinVideoButton from './component';

const JoinVideoOptionsContainer: React.FC = () => {
  const {
    pluginsExtensibleAreasAggregatedState,
  } = useContext(PluginsContext);
  let cameraSettingsDropdownItems: CameraSettingsDropdownInterface[] = [];
  if (pluginsExtensibleAreasAggregatedState.cameraSettingsDropdownItems) {
    cameraSettingsDropdownItems = [
      ...pluginsExtensibleAreasAggregatedState.cameraSettingsDropdownItems,
    ];
  }

  const hasVideoStream = useHasVideoStream();
  const disableReason = useDisableReason();
  const status = useStatus();
  const exitVideo = useExitVideo();
  const stopVideo = useStopVideo();
  const videoConnecting = status === 'videoConnecting';

  return (
    <JoinVideoButton
      cameraSettingsDropdownItems={cameraSettingsDropdownItems}
      hasVideoStream={hasVideoStream}
      disableReason={disableReason}
      status={status}
      exitVideo={exitVideo}
      stopVideo={stopVideo}
      videoConnecting={videoConnecting}
    />
  );
};

export default JoinVideoOptionsContainer;
