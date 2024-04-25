// @ts-nocheck
/* eslint-disable */
import React from 'react';
import { Session } from 'meteor/session';
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
  useIsUserLocked,
  useVideoStreams,
} from './hooks';
import { CAMERA_BROADCAST_START, CAMERA_BROADCAST_STOP } from './mutations';
import VideoProvider from './component';
import VideoService from './service';

interface VideoProviderContainerGraphqlProps {
  isGridLayout: boolean;
  currUserId: string;
  paginationEnabled: boolean;
  viewParticipantsWebcams: boolean;
  children: React.ReactNode;
}

const VideoProviderContainerGraphql: React.FC<VideoProviderContainerGraphqlProps> = ({ children, ...props }) => {
  const {
    isGridLayout,
    currUserId,
    paginationEnabled,
    viewParticipantsWebcams,
  } = props;
  const [cameraBroadcastStart] = useMutation(CAMERA_BROADCAST_START);
  const [cameraBroadcastStop] = useMutation(CAMERA_BROADCAST_STOP);

  const sendUserShareWebcam = (cameraId: string) => {
    return cameraBroadcastStart({ variables: { cameraId } });
  };

  const sendUserUnshareWebcam = (cameraId: string) => {
    cameraBroadcastStop({ variables: { cameraId } });
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
  } = useVideoStreams(isGridLayout, paginationEnabled, viewParticipantsWebcams);

  let usersVideo = streams;

  if (gridUsers.length > 0 && isGridLayout) {
    usersVideo = usersVideo.concat(gridUsers);
  }

  if (
    currentMeeting?.usersPolicies?.webcamsOnlyForModerator
    && currentUser?.locked
  ) {
    usersVideo = usersVideo.filter((uv) => uv.isUserModerator || uv.userId === currUserId);
  }

  const isUserLocked = useIsUserLocked();
  const currentVideoPageIndex = useCurrentVideoPageIndex();
  const exitVideo = useExitVideo();

  return (
    !usersVideo.length && !isGridLayout
      ? null
      : (
        <VideoProvider
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...props}
          playStart={playStart}
          sendUserUnshareWebcam={sendUserUnshareWebcam}
          streams={usersVideo}
          totalNumberOfStreams={totalNumberOfStreams}
          isUserLocked={isUserLocked}
          currentVideoPageIndex={currentVideoPageIndex}
          exitVideo={exitVideo}
          users={users}
        >
          {children}
        </VideoProvider>
      )
  );
};

export default withTracker(() => {
  const isGridLayout = Session.get('isGridEnabled');
  const currUserId = Auth.userID;
  const isMeteorConnected = Meteor.status().connected;

  return {
    currUserId,
    isGridLayout,
    isMeteorConnected,
    paginationEnabled: Settings.application.paginationEnabled,
    viewParticipantsWebcams: Settings.dataSaving.viewParticipantsWebcams,
  };
})(VideoProviderContainerGraphql);
