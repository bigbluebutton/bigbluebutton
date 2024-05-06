import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { useMutation } from '@apollo/client';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import Auth from '/imports/ui/services/auth';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import Settings from '/imports/ui/services/settings';
import {
  useCurrentVideoPageIndex,
  useExitVideo,
  useInfo,
  useIsUserLocked,
  useLockUser,
  useStopVideo,
  useVideoStreams,
} from './hooks';
import { CAMERA_BROADCAST_START } from './mutations';
import VideoProvider from './component';
import VideoService from './service';
import { Output } from '/imports/ui/components/layout/layoutTypes';
import { VideoItem } from './types';

interface VideoProviderContainerGraphqlProps {
  currentUserId: string;
  focusedId: string;
  swapLayout: boolean;
  isGridEnabled: boolean;
  paginationEnabled: boolean;
  isMeteorConnected: boolean;
  viewParticipantsWebcams: boolean;
  cameraDock: Output['cameraDock'];
  handleVideoFocus:(id: string) => void;
}

const VideoProviderContainerGraphql: React.FC<VideoProviderContainerGraphqlProps> = (props) => {
  const {
    currentUserId,
    paginationEnabled,
    viewParticipantsWebcams,
    cameraDock,
    focusedId,
    handleVideoFocus,
    isGridEnabled,
    isMeteorConnected,
    swapLayout,
  } = props;
  const [cameraBroadcastStart] = useMutation(CAMERA_BROADCAST_START);

  const sendUserShareWebcam = (cameraId: string) => {
    return cameraBroadcastStart({ variables: { cameraId } });
  };

  const playStart = (cameraId: string) => {
    if (VideoService.isLocalStream(cameraId)) {
      sendUserShareWebcam(cameraId).then(() => {
        setTimeout(() => {
          VideoService.joinedVideo();
        }, 500);
      });
    }
  };

  const { data: currentMeeting } = useMeeting((m) => ({
    usersPolicies: m.usersPolicies,
  }));

  const { data: currentUser } = useCurrentUser((user) => ({
    locked: user.locked,
  }));

  const {
    streams,
    gridUsers,
    totalNumberOfStreams,
    users,
  } = useVideoStreams(isGridEnabled, paginationEnabled, viewParticipantsWebcams);

  let usersVideo: VideoItem[] = streams;

  if (gridUsers.length > 0 && isGridEnabled) {
    usersVideo = usersVideo.concat(gridUsers);
  }

  if (
    currentMeeting?.usersPolicies?.webcamsOnlyForModerator
    && currentUser?.locked
  ) {
    usersVideo = usersVideo.filter(
      (uv) => (uv.type !== 'connecting' && uv.isModerator) || uv.userId === currentUserId,
    );
  }

  const isUserLocked = useIsUserLocked();
  const currentVideoPageIndex = useCurrentVideoPageIndex();
  const exitVideo = useExitVideo();
  const lockUser = useLockUser();
  const stopVideo = useStopVideo();
  const info = useInfo();

  if (!usersVideo.length && !isGridEnabled) return null;

  return (
    <VideoProvider
      cameraDock={cameraDock}
      focusedId={focusedId}
      handleVideoFocus={handleVideoFocus}
      isGridEnabled={isGridEnabled}
      isMeteorConnected={isMeteorConnected}
      swapLayout={swapLayout}
      currentUserId={currentUserId}
      paginationEnabled={paginationEnabled}
      viewParticipantsWebcams={viewParticipantsWebcams}
      totalNumberOfStreams={totalNumberOfStreams}
      isUserLocked={isUserLocked}
      currentVideoPageIndex={currentVideoPageIndex}
      streams={usersVideo}
      users={users}
      info={info}
      playStart={playStart}
      exitVideo={exitVideo}
      lockUser={lockUser}
      stopVideo={stopVideo}
    />
  );
};

type TrackerData = {
  currentUserId: string;
  isMeteorConnected: boolean;
  paginationEnabled: boolean;
  viewParticipantsWebcams: boolean;
};

type TrackerProps = {
  swapLayout: boolean;
  cameraDock: Output['cameraDock'];
  focusedId: string;
  handleVideoFocus:(id: string) => void;
  isGridEnabled: boolean;
};

export default withTracker<TrackerData, TrackerProps>(() => {
  const currentUserId = Auth.userID ?? '';
  const isMeteorConnected = Meteor.status().connected;
  // @ts-expect-error -> Untyped object.
  const { paginationEnabled } = Settings.application;
  // @ts-expect-error -> Untyped object.
  const { viewParticipantsWebcams } = Settings.dataSaving;
  return {
    currentUserId,
    isMeteorConnected,
    paginationEnabled,
    viewParticipantsWebcams,
  };
})(VideoProviderContainerGraphql);
