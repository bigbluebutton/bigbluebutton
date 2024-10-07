import React, { useEffect } from 'react';
import { useMutation, useReactiveVar } from '@apollo/client';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import {
  useCurrentVideoPageIndex,
  useExitVideo,
  useInfo,
  useIsPaginationEnabled,
  useIsUserLocked,
  useLockUser,
  useMyPageSize,
  useMyRole,
  useStopVideo,
  useVideoStreams,
} from './hooks';
import { CAMERA_BROADCAST_START } from './mutations';
import VideoProvider from './component';
import VideoService from './service';
import { Output } from '/imports/ui/components/layout/layoutTypes';
import { VideoItem } from './types';
import { debounce } from '/imports/utils/debounce';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';
import { useStorageKey } from '/imports/ui/services/storage/hooks';
import ConnectionStatus from '/imports/ui/core/graphql/singletons/connectionStatus';
import { setVideoState, useVideoState } from './state';
import { VIDEO_TYPES } from './enums';
import { useSubscription } from '../../core/hooks/createUseSubscription';
import { PRESENTER_ID } from './queries';

interface VideoProviderContainerProps {
  focusedId: string;
  swapLayout: boolean;
  cameraDock: Output['cameraDock'];
  handleVideoFocus:(id: string) => void;
}

const VideoProviderContainer: React.FC<VideoProviderContainerProps> = (props) => {
  const {
    cameraDock,
    focusedId,
    handleVideoFocus,
    swapLayout,
  } = props;
  const [cameraBroadcastStart] = useMutation(CAMERA_BROADCAST_START);

  const sendUserShareWebcam = (cameraId: string, contentType: string) => {
    return cameraBroadcastStart({ variables: { cameraId, contentType } });
  };

  const playStart = (cameraId: string) => {
    if (VideoService.isLocalStream(cameraId)) {
      const contentType = cameraId.includes('screenshare') ? 'screenshare' : 'camera';
      sendUserShareWebcam(cameraId, contentType).then(() => {
        VideoService.joinedVideo();
      });
    }
  };

  const {
    data: presenter,
  } = useSubscription(PRESENTER_ID);

  const {
    debounceTime: CAMERA_QUALITY_THR_DEBOUNCE = 2500,
  } = window.meetingClientSettings.public.kurento.cameraQualityThresholds;

  const applyCameraProfile = debounce(
    VideoService.applyCameraProfile,
    CAMERA_QUALITY_THR_DEBOUNCE,
    { leading: false, trailing: true },
  ) as typeof VideoService.applyCameraProfile;

  const { data: currentMeeting } = useMeeting((m) => ({
    usersPolicies: m.usersPolicies,
  }));

  const { data: currentUser } = useCurrentUser((user) => ({
    locked: user.locked,
    userId: user.userId,
  }));

  const currentUserId = currentUser?.userId ?? '';
  // @ts-ignore Untyped object
  const { paginationEnabled } = useSettings(SETTINGS.APPLICATION);
  // @ts-ignore Untyped object
  const { viewParticipantsWebcams } = useSettings(SETTINGS.DATA_SAVING);

  const isClientConnected = useReactiveVar(ConnectionStatus.getConnectedStatusVar());

  const {
    streams,
    gridUsers,
    totalNumberOfStreams,
    totalNumberOfOtherStreams,
  } = useVideoStreams();
  VideoService.updateActivePeers(streams);

  let usersVideo: VideoItem[] = streams;

  if (gridUsers.length > 0) {
    usersVideo = usersVideo.concat(gridUsers);
  }

  if (
    currentMeeting?.usersPolicies?.webcamsOnlyForModerator
    && currentUser?.locked
  ) {
    usersVideo = usersVideo.filter(
      (uv) => (
        (
          (uv.type === VIDEO_TYPES.STREAM && uv.user.isModerator)
          || (uv.type === VIDEO_TYPES.GRID && uv.isModerator)
        )
        || uv.userId === currentUserId
      ),
    );
  }

  const isUserLocked = useIsUserLocked();
  const currentVideoPageIndex = useCurrentVideoPageIndex();
  const exitVideo = useExitVideo();
  const lockUser = useLockUser();
  const stopVideo = useStopVideo();
  const info = useInfo();
  const myRole = useMyRole();
  const myPageSize = useMyPageSize();
  const { numberOfPages } = useVideoState();
  const isPaginationEnabled = useIsPaginationEnabled();
  const isGridEnabled = useStorageKey('isGridEnabled') as boolean;

  useEffect(() => {
    if (isPaginationEnabled) {
      const total = totalNumberOfOtherStreams ?? 0;
      const nOfPages = Math.ceil(total / myPageSize);

      if (nOfPages !== numberOfPages) {
        setVideoState({ numberOfPages: nOfPages });

        if (nOfPages === 0) {
          setVideoState({ currentVideoPageIndex: 0 });
        } else if (currentVideoPageIndex + 1 > nOfPages) {
          VideoService.getPreviousVideoPage();
        }
      }
    } else {
      setVideoState({
        numberOfPages: 0,
        currentVideoPageIndex: 0,
      });
    }
  }, [myPageSize, numberOfPages, totalNumberOfOtherStreams, isPaginationEnabled]);

  if ((!usersVideo.length && !isGridEnabled)) return null;
  if (!presenter) return null;

  return (
    <VideoProvider
      cameraDock={cameraDock}
      focusedId={focusedId}
      handleVideoFocus={handleVideoFocus}
      isGridEnabled={isGridEnabled}
      isClientConnected={isClientConnected}
      swapLayout={swapLayout}
      currentUserId={currentUserId}
      paginationEnabled={paginationEnabled}
      viewParticipantsWebcams={viewParticipantsWebcams}
      totalNumberOfStreams={totalNumberOfStreams}
      isUserLocked={isUserLocked}
      currentVideoPageIndex={currentVideoPageIndex}
      streams={usersVideo}
      info={info}
      playStart={playStart}
      exitVideo={exitVideo}
      lockUser={lockUser}
      stopVideo={stopVideo}
      applyCameraProfile={applyCameraProfile}
      myRole={myRole}
    />
  );
};

export default VideoProviderContainer;
