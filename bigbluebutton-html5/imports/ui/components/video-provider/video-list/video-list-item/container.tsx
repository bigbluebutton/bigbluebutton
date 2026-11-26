import React, { useCallback } from 'react';
import { UpdatedDataForUserCameraDomElement } from 'bigbluebutton-html-plugin-sdk/dist/cjs/dom-element-manipulation/user-camera/types';

import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { layoutSelect, layoutDispatch, layoutSelectInput } from '/imports/ui/components/layout/context';
import VideoListItem from './component';
import { VideoItem } from '/imports/ui/components/video-provider/types';
import { Layout, Input } from '/imports/ui/components/layout/layoutTypes';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';
import { useStorageKey } from '/imports/ui/services/storage/hooks';
import { UserCameraHelperAreas } from '../../../plugins-engine/extensible-areas/components/user-camera-helper/types';
import getFromUserSettings from '/imports/ui/services/users-settings';
import propsEqualIgnoringFloor from '../utils';

interface VideoListItemContainerProps {
  canFocus: boolean;
  cameraId: string | null;
  pluginUserCameraHelperPerPosition: UserCameraHelperAreas;
  name: string;
  focused: boolean;
  isStream: boolean;
  onHandleVideoFocus: ((id: string) => void) | null;
  stream: VideoItem;
  setUserCamerasRequestedFromPlugin: React.Dispatch<React.SetStateAction<UpdatedDataForUserCameraDomElement[]>>;
  onVideoItemUnmount: (stream: string) => void;
  onVirtualBgDrop: (stream: string | null, type: string, name: string, data: string) => Promise<unknown>;
  onVideoItemMount: (stream: string | null, ref: HTMLVideoElement) => void;
  raisedHandPosition: number;
}

// One array for every tile while the key is unset, so the item memo holds.
const NO_DISABLED_CAMS: string[] = [];

const VideoListItemContainer: React.FC<VideoListItemContainerProps> = (props) => {
  const {
    cameraId = '',
    focused,
    isStream,
    name,
    canFocus,
    onHandleVideoFocus,
    onVideoItemMount,
    onVideoItemUnmount,
    onVirtualBgDrop,
    setUserCamerasRequestedFromPlugin,
    stream,
    pluginUserCameraHelperPerPosition,
    raisedHandPosition,
  } = props;

  const fullscreen = layoutSelect((i: Layout) => i.fullscreen);
  const { element } = fullscreen;
  const isFullscreenContext = (element === cameraId);
  const layoutContextDispatch = layoutDispatch();
  const isRTL = layoutSelect((i: Layout) => i.isRTL);
  // @ts-ignore Untyped object
  const { selfViewDisable: settingsSelfViewDisable } = useSettings(SETTINGS.APPLICATION);

  const { data: currentUserData } = useCurrentUser((user) => ({
    isModerator: user.isModerator,
  }));

  const amIModerator = currentUserData?.isModerator;

  const disabledCams = useStorageKey('disabledCams') || NO_DISABLED_CAMS;

  const handleVideoItemMount = useCallback(
    (ref: HTMLVideoElement) => onVideoItemMount(cameraId, ref),
    [onVideoItemMount, cameraId],
  );
  const handleVirtualBgDrop = useCallback(
    (type: string, fileName: string, data: string) => onVirtualBgDrop(cameraId, type, fileName, data),
    [onVirtualBgDrop, cameraId],
  );

  const { hideNotificationToasts } = layoutSelectInput((i: Input) => i.notificationsBar);
  const hideNotifications = hideNotificationToasts
    || getFromUserSettings('bbb_hide_notifications', false);

  return (
    <VideoListItem
      {...{
        isFullscreenContext,
        layoutContextDispatch,
        isRTL,
        amIModerator,
      }}
      pluginUserCameraHelperPerPosition={pluginUserCameraHelperPerPosition}
      setUserCamerasRequestedFromPlugin={setUserCamerasRequestedFromPlugin}
      cameraId={cameraId}
      disabledCams={disabledCams}
      focused={focused}
      isStream={isStream}
      name={name}
      canFocus={canFocus}
      onHandleVideoFocus={onHandleVideoFocus}
      onVideoItemMount={handleVideoItemMount}
      onVideoItemUnmount={onVideoItemUnmount}
      onVirtualBgDrop={handleVirtualBgDrop}
      settingsSelfViewDisable={settingsSelfViewDisable}
      stream={stream}
      raisedHandPosition={raisedHandPosition}
      hideNotificationToasts={hideNotifications}
    />
  );
};

export default React.memo(
  VideoListItemContainer,
  propsEqualIgnoringFloor<VideoListItemContainerProps>(['stream']),
);
