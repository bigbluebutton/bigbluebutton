// @ts-nocheck
/* eslint-disable */
import React from 'react';
import { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { injectIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import JoinVideoButton from './component';
import VideoService from '../service';
import {
  updateSettings,
} from '/imports/ui/components/settings/service';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import { CAMERA_BROADCAST_STOP } from '../mutations';
import useUserChangedLocalSettings from '/imports/ui/services/settings/hooks/useUserChangedLocalSettings';
import {
  useDisableReason, useExitVideo, useHasVideoStream, useStatus, useStreams,
} from '/imports/ui/components/video-provider/video-provider-graphql/hooks';

const JoinVideoOptionsContainer = (props) => {
  const {
    updateSettings,
    intl,
    ...restProps
  } = props;

  const { streams } = useStreams();
  const [cameraBroadcastStop] = useMutation(CAMERA_BROADCAST_STOP);
  const setLocalSettings = useUserChangedLocalSettings();

  const sendUserUnshareWebcam = (cameraId) => {
    cameraBroadcastStop({ variables: { cameraId } });
  };

  const {
    pluginsExtensibleAreasAggregatedState,
  } = useContext(PluginsContext);
  let cameraSettingsDropdownItems = [];
  if (pluginsExtensibleAreasAggregatedState.cameraSettingsDropdownItems) {
    cameraSettingsDropdownItems = [
      ...pluginsExtensibleAreasAggregatedState.cameraSettingsDropdownItems,
    ];
  }

  const hasVideoStream = useHasVideoStream();
  const disableReason = useDisableReason();
  const status = useStatus();
  const exitVideo = useExitVideo()

  return (
    <JoinVideoButton {...{
      cameraSettingsDropdownItems,
      hasVideoStream,
      updateSettings,
      disableReason,
      status,
      sendUserUnshareWebcam,
      setLocalSettings,
      streams,
      exitVideo,
      ...restProps,
    }}
    />
  );
};

export default injectIntl(withTracker(() => ({
  updateSettings,
}))(JoinVideoOptionsContainer));
