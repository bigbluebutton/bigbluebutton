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
import { useScreenshare, screenshareHasEnded } from '/imports/ui/components/screenshare/service';

interface VideoProviderContainerProps {
  focusedId: string;
  cameraDock: Output['cameraDock'];
  handleVideoFocus:(id: string) => void;
  screenShare?: boolean;
  streams?: VideoItem[];
}

const VideoProviderContainer: React.FC<VideoProviderContainerProps> = (props) => {
  const {
    cameraDock,
    focusedId,
    handleVideoFocus,
    screenShare,
    streams: propStreams,
  } = props;

  const [cameraBroadcastStart] = useMutation(CAMERA_BROADCAST_START);
  const [meetingSettings] = useMeetingSettings();
  const connectingStream = useConnectingStream();

  const sendUserShareWebcam = (cameraId: string, contentType: string = 'camera') => {
    return cameraBroadcastStart({ variables: { cameraId, contentType } });
  };

  const playStart = (cameraId: string, contentType: string = 'camera') => {
    if (VideoService.isLocalStream(cameraId)) {
      sendUserShareWebcam(cameraId, contentType).then(() => {
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
    lockSettings: m.lockSettings,
  }));

  const { data: currentUser } = useCurrentUser((user) => ({
    locked: user.locked,
    userId: user.userId,
    presenter: user.presenter,
  }));

  const currentUserId = currentUser?.userId ?? '';
  // @ts-ignore Untyped object
  const { paginationEnabled } = useSettings(SETTINGS.APPLICATION);
  // @ts-ignore Untyped object
  const { viewParticipantsWebcams } = useSettings(SETTINGS.DATA_SAVING);

  const isClientConnected = useReactiveVar(ConnectionStatus.getConnectedStatusVar());

  const {
    gridUsers,
    totalNumberOfStreams,
    totalNumberOfOtherStreams,
    streams: hookStreams,
  } = useVideoStreams();

  const streams = propStreams ?? hookStreams;

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
  const { data: screenshares } = useScreenshare();

  useEffect(() => {
    if (!isPaginationEnabled || myPageSize <= 0) {
      setVideoState({
        numberOfPages: 0,
        currentVideoPageIndex: 0,
      });
      return;
    }

    const total = totalNumberOfOtherStreams ?? 0;
    const nOfPages = Math.ceil(total / myPageSize);

    if (!Number.isFinite(nOfPages)) {
      setVideoState({
        numberOfPages: 0,
        currentVideoPageIndex: 0,
      });
      return;
    }

    if (nOfPages !== numberOfPages) {
      setVideoState({ numberOfPages: nOfPages });

      if (nOfPages === 0) {
        setVideoState({ currentVideoPageIndex: 0 });
      } else if (currentVideoPageIndex + 1 > nOfPages) {
        VideoService.getPreviousVideoPage();
      }
    }
  }, [
    myPageSize,
    numberOfPages,
    totalNumberOfOtherStreams,
    isPaginationEnabled,
    currentVideoPageIndex,
  ]);

  // Clean up local connecting stream state if the stream is connected
  useEffect(() => {
    if (!connectingStream) return;

    const streamIsConnected = streams && streams.some(
      (s) => s.type === VIDEO_TYPES.STREAM && s.stream === connectingStream.stream,
    );

    if (streamIsConnected) setConnectingStream(null);
  }, [streams, connectingStream]);

  useEffect(() => {
    const viewersCanShare = currentMeeting?.lockSettings?.viewersCanShareScreen;
    if (viewersCanShare === false && !currentUser?.presenter) {
      const myScreenshare = screenshares?.find((s: any) => s.userId === currentUserId);
      if (myScreenshare) {
        screenshareHasEnded();
        stopVideo(myScreenshare.streamId || myScreenshare.stream);
      }
    }
  }, [currentMeeting?.lockSettings?.viewersCanShareScreen, currentUser?.presenter, screenshares, currentUserId, stopVideo]);

  if (!usersVideo.length && !isGridEnabled) return null;

  const providerProps = {
    cameraDock,
    focusedId,
    handleVideoFocus,
    isGridEnabled,
    currentUserId,
    paginationEnabled,
    viewParticipantsWebcams,
    isClientConnected,
    totalNumberOfStreams,
    isUserLocked,
    currentVideoPageIndex,
    streams: usersVideo,
    playStart,
    exitVideo,
    lockUser,
    stopVideo,
    applyCameraProfile,
    info,
    screenShare,
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
