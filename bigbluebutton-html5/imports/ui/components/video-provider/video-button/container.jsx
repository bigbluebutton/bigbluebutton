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
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';

const JoinVideoOptionsContainer = (props) => {
  const {
    updateSettings,
    hasVideoStream,
    disableReason,
    status,
    intl,
    ...restProps
  } = props;

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

  const { data: currentUserData } = useCurrentUser((user) => ({
    away: user.away,
  }));

  const away = currentUserData?.away;

  return (
    <JoinVideoButton {...{
      cameraSettingsDropdownItems,
      hasVideoStream,
      updateSettings,
      disableReason,
      status,
      sendUserUnshareWebcam,
      setLocalSettings,
      away,
      ...restProps,
    }}
    />
  );
};

export default injectIntl(withTracker(() => ({
  hasVideoStream: VideoService.hasVideoStream(),
  updateSettings,
  disableReason: VideoService.disableReason(),
  status: VideoService.getStatus(),
}))(JoinVideoOptionsContainer));
