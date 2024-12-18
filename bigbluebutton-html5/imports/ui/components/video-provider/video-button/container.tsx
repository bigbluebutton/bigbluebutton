import React, { useContext } from 'react';
import { CameraSettingsDropdownInterface } from 'bigbluebutton-html-plugin-sdk';
import { updateSettings } from '/imports/ui/components/settings/service';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import useUserChangedLocalSettings from '/imports/ui/services/settings/hooks/useUserChangedLocalSettings';
import {
  useDisableReason, useExitVideo, useHasVideoStream, useStatus, useStopVideo,
} from '/imports/ui/components/video-provider/hooks';
import JoinVideoButton from './component';

const JoinVideoOptionsContainer: React.FC = () => {
  const setLocalSettings = useUserChangedLocalSettings();

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
      updateSettings={updateSettings}
      disableReason={disableReason}
      status={status}
      setLocalSettings={setLocalSettings}
      exitVideo={exitVideo}
      stopVideo={stopVideo}
      videoConnecting={videoConnecting}
    />
  );
};

export default JoinVideoOptionsContainer;
