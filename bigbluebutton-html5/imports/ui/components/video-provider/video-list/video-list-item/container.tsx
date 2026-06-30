import React from 'react';
import { UpdatedDataForUserCameraDomElement } from 'bigbluebutton-html-plugin-sdk/dist/cjs/dom-element-manipulation/user-camera/types';

import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { layoutSelect, layoutDispatch, layoutSelectInput } from '/imports/ui/components/layout/context';
import VideoListItem from './component';
import { VideoItem } from '/imports/ui/components/video-provider/types';
import { Layout, Input } from '/imports/ui/components/layout/layoutTypes';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';
import { useStorageKey } from '/imports/ui/services/storage/hooks';
import useWhoIsTalking from '/imports/ui/core/hooks/useWhoIsTalking';
import useWhoIsUnmuted from '/imports/ui/core/hooks/useWhoIsUnmuted';
import { VIDEO_TYPES } from '/imports/ui/components/video-provider/enums';
import { UserCameraHelperAreas } from '../../../plugins-engine/extensible-areas/components/user-camera-helper/types';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { RaisedHandUser } from '/imports/ui/Types/user';
import { RAISED_HAND_USERS } from '/imports/ui/core/graphql/queries/users';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { filterByMeetingId } from '/imports/ui/core/utils/subscriptionFilters';

interface VideoListItemContainerProps {
  numOfStreams: number;
  cameraId: string | null;
  pluginUserCameraHelperPerPosition: UserCameraHelperAreas;
  userId: string;
  name: string;
  focused: boolean;
  isStream: boolean;
  onHandleVideoFocus: ((id: string) => void) | null;
  stream: VideoItem;
  setUserCamerasRequestedFromPlugin: React.Dispatch<React.SetStateAction<UpdatedDataForUserCameraDomElement[]>>;
  onVideoItemUnmount: (stream: string) => void;
  onVirtualBgDrop: (type: string, name: string, data: string) => void;
  onVideoItemMount: (ref: HTMLVideoElement) => void;
}

const VideoListItemContainer: React.FC<VideoListItemContainerProps> = (props) => {
  const {
    cameraId = '',
    focused,
    isStream,
    name,
    numOfStreams,
    onHandleVideoFocus,
    onVideoItemMount,
    onVideoItemUnmount,
    onVirtualBgDrop,
    setUserCamerasRequestedFromPlugin,
    stream,
    userId,
    pluginUserCameraHelperPerPosition,
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
    locked: user.locked,
  }));

  const { data: currentMeeting } = useMeeting((m) => ({
    lockSettings: m.lockSettings,
    meetingId: m.meetingId,
  }));

  const isolateUsers = currentUserData?.locked && currentMeeting?.lockSettings?.isolateUsers;

  const amIModerator = currentUserData?.isModerator;

  const disabledCams = useStorageKey('disabledCams') || [];
  const { data: talkingUsers } = useWhoIsTalking();
  const { data: unmutedUsers } = useWhoIsUnmuted();
  const voiceUser = stream.type !== VIDEO_TYPES.CONNECTING && stream.voice ? {
    ...stream.voice,
    talking: talkingUsers[userId],
    muted: !unmutedUsers[userId],
  } : {};

  const {
    data: usersData,
  } = useDeduplicatedSubscription<{ user: RaisedHandUser[] }>(RAISED_HAND_USERS);
  const raisedHands: RaisedHandUser[] = currentMeeting?.meetingId
    ? filterByMeetingId(
      usersData?.user,
      currentMeeting.meetingId,
      RAISED_HAND_USERS,
      (u) => ({ mismatchedUserId: u.userId }),
    )
    : [];
  const raisedHandIndex = !isolateUsers
    ? raisedHands.findIndex((user) => user.userId === userId) + 1
    : 0;

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
      numOfStreams={numOfStreams}
      onHandleVideoFocus={onHandleVideoFocus}
      onVideoItemMount={onVideoItemMount}
      onVideoItemUnmount={onVideoItemUnmount}
      onVirtualBgDrop={onVirtualBgDrop}
      settingsSelfViewDisable={settingsSelfViewDisable}
      stream={stream}
      voiceUser={voiceUser}
      raisedHandPosition={raisedHandIndex}
      hideNotificationToasts={hideNotifications}
    />
  );
};

export default VideoListItemContainer;
