import React, { useEffect } from 'react';
import { useMutation, useReactiveVar } from '@apollo/client';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import useMeetingSettings from '/imports/ui/core/local-states/useMeetingSettings';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import {
  useCurrentVideoPageIndex,
  useExitVideo,
  useInfo,
  useIsPaginationEnabled,
  useIsUserLocked,
  useLockUser,
  useMyPageSize,
  useStopVideo,
  useVideoStreams,
} from './hooks';
import { CAMERA_BROADCAST_START } from './mutations';
import VideoProvider from './component';
import LiveKitCameraBridge from '/imports/ui/components/video-provider/livekit-camera-bridge/component';
import VideoService from './service';
import { Output } from '/imports/ui/components/layout/layoutTypes';
import { VideoItem } from './types';
import { debounce } from '/imports/utils/debounce';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';
import { useStorageKey } from '/imports/ui/services/storage/hooks';
import ConnectionStatus from '/imports/ui/core/graphql/singletons/connectionStatus';
import {
  useConnectingStream,
  setConnectingStream,
  setVideoState,
  useVideoState,
} from './state';
import { VIDEO_TYPES } from './enums';

interface VideoProviderContainerProps {
  focusedId: string;
  cameraDock: Output['cameraDock'];
  handleVideoFocus:(id: string) => void;
}

const VideoProviderContainer: React.FC<VideoProviderContainerProps> = (props) => {
  const {
    cameraDock,
    focusedId,
    handleVideoFocus,
  } = props;
  const [cameraBroadcastStart] = useMutation(CAMERA_BROADCAST_START);
  const [meetingSettings] = useMeetingSettings();
  const connectingStream = useConnectingStream();

  const sendUserShareWebcam = (cameraId: string) => {
    return cameraBroadcastStart({ variables: { cameraId, contentType: 'camera' } });
  };

  const playStart = (cameraId: string) => {
    if (VideoService.isLocalStream(cameraId)) {
      sendUserShareWebcam(cameraId).then(() => {
        VideoService.joinedVideo();
      });
    }
  };

  const {
    debounceTime: CAMERA_QUALITY_THR_DEBOUNCE = 2500,
  } = meetingSettings.public.kurento.cameraQualityThresholds;

  const applyCameraProfile = debounce(
    VideoService.applyCameraProfile,
    CAMERA_QUALITY_THR_DEBOUNCE,
    { leading: false, trailing: true },
  ) as typeof VideoService.applyCameraProfile;

  const { data: currentMeeting } = useMeeting((m) => ({
    usersPolicies: m.usersPolicies,
    cameraBridge: m.cameraBridge,
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

  // Clean up local connecting stream state if the stream is connected
  useEffect(() => {
    if (!connectingStream) return;

    const streamIsConnected = streams && streams.some(
      (s) => s.type === VIDEO_TYPES.STREAM && s.stream === connectingStream.stream,
    );

    if (streamIsConnected) setConnectingStream(null);
  }, [streams, connectingStream]);

  if (!usersVideo.length && !isGridEnabled) return null;

  const providerProps = {
    cameraDock,
    focusedId,
    handleVideoFocus,
    isGridEnabled,
    isClientConnected,
    currentUserId,
    paginationEnabled,
    viewParticipantsWebcams,
    totalNumberOfStreams,
    isUserLocked,
    currentVideoPageIndex,
    streams: usersVideo,
    info,
    playStart,
    exitVideo,
    lockUser,
    stopVideo,
    applyCameraProfile,
  };

  switch (currentMeeting?.cameraBridge) {
    case 'livekit':
      return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <LiveKitCameraBridge {...providerProps} />
      );
    case 'bbb-webrtc-sfu':
    default:
      return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <VideoProvider {...providerProps} />
      );
  }
};

export default VideoProviderContainer;
