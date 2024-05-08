import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  useSubscription,
  useReactiveVar,
  useLazyQuery,
  useMutation,
} from '@apollo/client';
import { Meteor } from 'meteor/meteor';
import Auth from '/imports/ui/services/auth';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { partition } from '/imports/utils/array-utils';
import { USER_AGGREGATE_COUNT_SUBSCRIPTION } from '/imports/ui/core/graphql/queries/users';
import {
  getSortingMethod,
  sortVideoStreams,
} from '/imports/ui/components/video-provider/video-provider-graphql/stream-sorting';
import {
  useVideoState,
  setVideoState,
  useConnectingStream,
  streams,
  getVideoState,
} from '../state';
import {
  OWN_VIDEO_STREAMS_QUERY,
  VIDEO_STREAMS_USERS_FILTERED_SUBSCRIPTION,
  GRID_USERS_SUBSCRIPTION,
  VIEWERS_IN_WEBCAM_COUNT_SUBSCRIPTION,
  VideoStreamsUsersResponse,
  OwnVideoStreamsResponse,
} from '../queries';
import videoService from '../service';
import { CAMERA_BROADCAST_STOP } from '../mutations';
import { StreamItem } from '../types';
import { DesktopPageSizes, MobilePageSizes } from '/imports/ui/Types/meetingClientSettings';
import logger from '/imports/startup/client/logger';

const ROLE_MODERATOR = window.meetingClientSettings.public.user.role_moderator;
const ROLE_VIEWER = window.meetingClientSettings.public.user.role_viewer;
const {
  desktopPageSizes: DESKTOP_PAGE_SIZES,
  mobilePageSizes: MOBILE_PAGE_SIZES,
  desktopGridSizes: DESKTOP_GRID_SIZES,
  mobileGridSizes: MOBILE_GRID_SIZES,
} = window.meetingClientSettings.public.kurento.pagination;
const PAGINATION_THRESHOLDS_CONF = window.meetingClientSettings.public.kurento.paginationThresholds;
const PAGINATION_THRESHOLDS = PAGINATION_THRESHOLDS_CONF.thresholds.sort(
  (t1, t2) => t1.users - t2.users,
);
const PAGINATION_THRESHOLDS_ENABLED = PAGINATION_THRESHOLDS_CONF.enabled;
const {
  paginationSorting: PAGINATION_SORTING,
  defaultSorting: DEFAULT_SORTING,
} = window.meetingClientSettings.public.kurento.cameraSortingModes;

const FILTER_VIDEO_STATS = [
  'outbound-rtp',
  'inbound-rtp',
];

export const useStatus = () => {
  const videoState = useVideoState()[0];
  if (videoState.isConnecting) return 'videoConnecting';
  if (videoState.isConnected) return 'connected';
  return 'disconnected';
};

export const useDisableReason = () => {
  const videoLocked = useIsUserLocked();
  const hasCapReached = useHasCapReached();
  const hasVideoStream = useHasVideoStream();
  const locks = {
    videoLocked,
    camCapReached: hasCapReached && !hasVideoStream,
    meteorDisconnected: !Meteor.status().connected,
  };
  const locksKeys = Object.keys(locks);
  const disableReason = locksKeys
    .filter((i) => locks[i as keyof typeof locks])
    .shift();
  return disableReason;
};

export const useIsUserLocked = () => {
  const disableCam = useDisableCam();
  const { data: currentUser } = useCurrentUser((u) => ({
    locked: u.locked,
    isModerator: u.isModerator,
  }));
  return !!currentUser?.locked && !currentUser.isModerator && disableCam;
};

export const useVideoStreamsCount = () => {
  const { streams } = useStreams();

  return streams.length;
};

export const useLocalVideoStreamsCount = () => {
  const { streams } = useStreams();
  const localStreams = streams.filter((vs) => vs.userId === Auth.userID);

  return localStreams.length;
};

export const useInfo = () => {
  const { data } = useMeeting((m) => ({
    voiceSettings: {
      // @ts-expect-error -> There seems to be a design issue on the projection portion.
      voiceConf: m.voiceSettings?.voiceConf,
    },
  }));
  const voiceBridge = data?.voiceSettings ? data.voiceSettings.voiceConf : null;
  return {
    userId: Auth.userID,
    userName: Auth.fullname,
    meetingId: Auth.meetingID,
    sessionToken: Auth.sessionToken,
    voiceBridge,
  };
};

export const useHasCapReached = () => {
  const { data: meeting } = useMeeting((m) => ({
    meetingCameraCap: m.meetingCameraCap,
    usersPolicies: {
      // @ts-expect-error -> There seems to be a design issue on the projection portion.
      userCameraCap: m.usersPolicies?.userCameraCap,
    },
  }));
  const videoStreamsCount = useVideoStreamsCount();
  const localVideoStreamsCount = useLocalVideoStreamsCount();

  // If the meeting prop data is unreachable, force a safe return
  if (
    meeting?.usersPolicies === undefined
    || !meeting?.meetingCameraCap === undefined
  ) return true;
  const { meetingCameraCap } = meeting;
  const { userCameraCap } = meeting.usersPolicies;

  // @ts-expect-error -> There seems to be a design issue on the projection portion.
  const meetingCap = meetingCameraCap !== 0 && videoStreamsCount >= meetingCameraCap;
  const userCap = userCameraCap !== 0 && localVideoStreamsCount >= userCameraCap;

  return meetingCap || userCap;
};

export const useDisableCam = () => {
  const { data: meeting } = useMeeting((m) => ({
    lockSettings: {
      // @ts-expect-error -> There seems to be a design issue on the projection portion.
      disableCam: m.lockSettings?.disableCam,
    },
  }));
  return meeting?.lockSettings ? meeting?.lockSettings.disableCam : false;
};

export const usePageSizeDictionary = () => {
  const { data: countData } = useSubscription(
    USER_AGGREGATE_COUNT_SUBSCRIPTION,
  );
  const userCount = countData?.user_aggregate?.aggregate?.count || 0;
  // Dynamic page sizes are disabled. Fetch the stock page sizes.
  if (!PAGINATION_THRESHOLDS_ENABLED || PAGINATION_THRESHOLDS.length <= 0) {
    return !videoService.isMobile ? DESKTOP_PAGE_SIZES : MOBILE_PAGE_SIZES;
  }

  // Dynamic page sizes are enabled. Get the user count, isolate the
  // matching threshold entry, return the val.
  let targetThreshold;
  const processThreshold = (
    threshold: {
      desktopPageSizes?: DesktopPageSizes,
      mobilePageSizes?: MobilePageSizes,
    } = {
      desktopPageSizes: DESKTOP_PAGE_SIZES,
      mobilePageSizes: MOBILE_PAGE_SIZES,
    },
  ) => {
    // We don't demand that all page sizes should be set in pagination profiles.
    // That saves us some space because don't necessarily need to scale mobile
    // endpoints.
    // If eg mobile isn't set, then return the default value.
    if (!videoService.isMobile) {
      return threshold.desktopPageSizes || DESKTOP_PAGE_SIZES;
    }
    return threshold.mobilePageSizes || MOBILE_PAGE_SIZES;
  };

  // Short-circuit: no threshold yet, return stock values (processThreshold has a default arg)
  if (userCount < PAGINATION_THRESHOLDS[0].users) return processThreshold();

  // Reverse search for the threshold where our participant count is directly equal or great
  // The PAGINATION_THRESHOLDS config is sorted when imported.
  for (
    let mapIndex = PAGINATION_THRESHOLDS.length - 1;
    mapIndex >= 0;
    mapIndex -= 1
  ) {
    targetThreshold = PAGINATION_THRESHOLDS[mapIndex];
    if (targetThreshold.users <= userCount) {
      return processThreshold(targetThreshold);
    }
  }
  return undefined;
};

export const useMyRole = () => {
  const { data } = useCurrentUser((u) => ({ role: u.role }));
  return data?.role;
};

export const useMyPageSize = () => {
  const myRole = useMyRole();
  const pageSizes = usePageSizeDictionary();
  let size;
  switch (myRole) {
    case ROLE_MODERATOR:
      size = pageSizes?.moderator;
      break;
    case ROLE_VIEWER:
    default:
      size = pageSizes?.viewer;
  }

  return size ?? 0;
};

export const useIsPaginationEnabled = (paginationEnabled: boolean) => useMyPageSize() > 0 && paginationEnabled;

export const useStreams = () => {
  const videoStreams = useReactiveVar(streams);
  return { streams: videoStreams };
};

type StreamUser = VideoStreamsUsersResponse['user'][number] & {
  pin: boolean;
  sortName: string;
};

type GridUser = StreamUser & { type: 'grid' };

export const useStreamUsers = (isGridEnabled: boolean) => {
  const { streams } = useStreams();
  const gridSize = useGridSize();
  const [users, setUsers] = useState<StreamUser[]>([]);
  const [gridUsers, setGridUsers] = useState<GridUser[]>([]);
  const userIds = useMemo(() => streams.map((s) => s.userId), [streams]);
  const streamCount = streams.length;
  const { data, loading, error } = useSubscription<VideoStreamsUsersResponse>(
    VIDEO_STREAMS_USERS_FILTERED_SUBSCRIPTION,
    { variables: { userIds } },
  );
  const {
    data: gridData,
    loading: gridLoading,
    error: gridError,
  } = useSubscription<VideoStreamsUsersResponse>(
    GRID_USERS_SUBSCRIPTION,
    {
      variables: { exceptUserIds: userIds, limit: Math.max(gridSize - streamCount, 0) },
      skip: !isGridEnabled,
    },
  );

  useEffect(() => {
    if (loading) return;

    if (error) {
      logger.error(`Stream users subscription failed. name=${error.name}`, error);
    }

    if (data) {
      const newUsers = data.user.map((user) => ({
        ...user,
        pin: user.pinned,
        sortName: user.nameSortable,
      }));
      setUsers(newUsers);
    } else {
      setUsers([]);
    }
  }, [data]);

  useEffect(() => {
    if (gridLoading) return;

    if (gridError) {
      logger.error(`Grid users subscription failed. name=${gridError.name}`, gridError);
    }

    if (gridData) {
      const newGridUsers = gridData.user.map((user) => ({
        ...user,
        pin: user.pinned,
        sortName: user.nameSortable,
        type: 'grid' as const,
      }));
      setGridUsers(newGridUsers);
    } else {
      setGridUsers([]);
    }
  }, [gridData]);

  return {
    streams,
    users,
    gridUsers,
    loading: loading || gridLoading,
    error: error || gridError,
  };
};

export const useSharedDevices = () => {
  const { streams } = useStreams();
  const devices = streams
    .filter((s) => s.userId === Auth.userID)
    .map((vs) => vs.deviceId);

  return devices;
};

export const useNumberOfPages = () => {
  const state = useVideoState()[0];
  return state.numberOfPages;
};

export const useCurrentVideoPageIndex = () => {
  const state = useVideoState()[0];
  return state.currentVideoPageIndex;
};

export const useGridSize = () => {
  let size;
  const myRole = useMyRole();
  const gridSizes = !videoService.isMobile
    ? DESKTOP_GRID_SIZES
    : MOBILE_GRID_SIZES;

  switch (myRole) {
    case ROLE_MODERATOR:
      size = gridSizes.moderator;
      break;
    case ROLE_VIEWER:
    default:
      size = gridSizes.viewer;
  }

  return size;
};

export const useVideoStreams = (
  isGridEnabled: boolean,
  paginationEnabled: boolean,
  viewParticipantsWebcams: boolean,
) => {
  const [state] = useVideoState();
  const { currentVideoPageIndex, numberOfPages } = state;
  const { users, gridUsers, streams: videoStreams } = useStreamUsers(isGridEnabled);
  const connectingStream = useConnectingStream(videoStreams);
  const myPageSize = useMyPageSize();
  const isPaginationEnabled = useIsPaginationEnabled(paginationEnabled);
  let streams: StreamItem[] = [...videoStreams];

  if (connectingStream) streams.push(connectingStream);

  if (!viewParticipantsWebcams) {
    streams = streams.filter((stream) => stream.userId === Auth.userID);
  }

  if (isPaginationEnabled) {
    const [filtered, others] = partition(
      streams,
      (vs: StreamItem) => Auth.userID === vs.userId || (vs.type === 'stream' && vs.pin),
    );
    const [pin, mine] = partition(
      filtered,
      (vs: StreamItem) => vs.type === 'stream' && vs.pin,
    );

    if (myPageSize !== 0) {
      const total = others.length ?? 0;
      const nOfPages = Math.ceil(total / myPageSize);

      if (nOfPages !== numberOfPages) {
        setVideoState((curr) => ({
          ...curr,
          numberOfPages: nOfPages,
        }));

        if (nOfPages === 0) {
          setVideoState((curr) => ({
            ...curr,
            currentVideoPageIndex: 0,
          }));
        } else if (currentVideoPageIndex + 1 > nOfPages) {
          videoService.getPreviousVideoPage();
        }
      }
    }

    const chunkIndex = currentVideoPageIndex * myPageSize;

    const sortingMethod = (numberOfPages > 1) ? PAGINATION_SORTING : DEFAULT_SORTING;
    const paginatedStreams = sortVideoStreams(others, sortingMethod)
      .slice(chunkIndex, (chunkIndex + myPageSize)) || [];

    if (getSortingMethod(sortingMethod).localFirst) {
      streams = [...pin, ...mine, ...paginatedStreams];
    } else {
      streams = [...pin, ...paginatedStreams, ...mine];
    }
  } else {
    streams = sortVideoStreams(streams, DEFAULT_SORTING);
  }

  return {
    streams,
    gridUsers,
    totalNumberOfStreams: streams.length,
    users,
  };
};

export const useHasVideoStream = () => {
  const { streams } = useStreams();
  return streams.some((s) => s.userId === Auth.userID);
};

const useOwnVideoStreamsQuery = () => useLazyQuery<OwnVideoStreamsResponse>(
  OWN_VIDEO_STREAMS_QUERY,
  { variables: { userId: Auth.userID } },
);

export const useExitVideo = (forceExit = false) => {
  const [cameraBroadcastStop] = useMutation(CAMERA_BROADCAST_STOP);
  const [getOwnVideoStreams] = useOwnVideoStreamsQuery();

  const exitVideo = useCallback(async () => {
    const { isConnected } = getVideoState();

    if (isConnected || forceExit) {
      const sendUserUnshareWebcam = (cameraId: string) => {
        cameraBroadcastStop({ variables: { cameraId } });
      };

      return getOwnVideoStreams().then(({ data }) => {
        if (data) {
          const streams = data.user_camera || [];
          streams.forEach((s: { streamId: string }) => sendUserUnshareWebcam(s.streamId));
          videoService.exitedVideo();
        }
        return null;
      });
    }
    return Promise.resolve(null);
  }, [cameraBroadcastStop]);

  return exitVideo;
};

export const useViewersInWebcamCount = (): number => {
  const { data } = useSubscription(VIEWERS_IN_WEBCAM_COUNT_SUBSCRIPTION);
  return data?.user_camera_aggregate?.aggregate?.count || 0;
};

export const useLockUser = () => {
  const exitVideo = useExitVideo();
  return useCallback(() => {
    const { isConnected } = getVideoState();
    if (isConnected) {
      exitVideo();
    }
  }, [exitVideo]);
};

export const useStopVideo = () => {
  const [cameraBroadcastStop] = useMutation(CAMERA_BROADCAST_STOP);
  const [getOwnVideoStreams] = useOwnVideoStreamsQuery();
  const exit = useExitVideo(true);

  return useCallback(async (cameraId?: string) => {
    const { data } = await getOwnVideoStreams();
    const streams = data?.user_camera ?? [];
    const hasTargetStream = streams.some((s) => s.streamId === cameraId);
    const hasOtherStream = streams.some((s) => s.streamId !== cameraId);

    if (hasTargetStream) {
      cameraBroadcastStop({ variables: { cameraId } });
    }

    if (!hasOtherStream) {
      videoService.exitedVideo();
    } else {
      exit().then(() => {
        videoService.exitedVideo();
      });
    }
  }, [cameraBroadcastStop]);
};

export const useActivePeers = (
  isGridEnabled: boolean,
  paginationEnabled: boolean,
  viewParticipantsWebcams: boolean,
) => {
  const videoData = useVideoStreams(
    isGridEnabled,
    paginationEnabled,
    viewParticipantsWebcams,
  );

  if (!videoData) return null;

  const { streams: activeVideoStreams } = videoData;

  if (!activeVideoStreams) return null;

  const activePeers: Record<string, RTCPeerConnection> = {};

  activeVideoStreams.forEach((stream) => {
    if (videoService.webRtcPeersRef()[stream.stream]) {
      activePeers[stream.stream] = videoService.webRtcPeersRef()[stream.stream].peerConnection;
    }
  });

  return activePeers;
};

export const useGetStats = (
  isGridEnabled: boolean,
  paginationEnabled: boolean,
  viewParticipantsWebcams: boolean,
) => {
  const peers = useActivePeers(
    isGridEnabled,
    paginationEnabled,
    viewParticipantsWebcams,
  );

  return useCallback(async () => {
    if (!peers) return null;

    const stats: Record<string, unknown> = {};

    await Promise.all(
      Object.keys(peers).map(async (peerId) => {
        const peerStats = await peers[peerId].getStats();

        const videoStats: Record<string, unknown> = {};

        peerStats.forEach((stat) => {
          if (FILTER_VIDEO_STATS.includes(stat.type)) {
            videoStats[stat.type] = stat;
          }
        });
        stats[peerId] = videoStats;
      }),
    );

    return stats;
  }, [peers]);
};
