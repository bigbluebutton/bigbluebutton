// @ts-nocheck
/* eslint-disable */
import { useCallback, useEffect, useMemo } from 'react';
import { useSubscription, useReactiveVar, useLazyQuery, useMutation } from '@apollo/client';
import { Meteor } from 'meteor/meteor';
import Settings from '/imports/ui/services/settings';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import getFromUserSettings from '/imports/ui/services/users-settings';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { partition } from '/imports/utils/array-utils';
import { USER_AGGREGATE_COUNT_SUBSCRIPTION } from '/imports/ui/core/graphql/queries/users';
import {
  getSortingMethod,
  sortVideoStreams,
} from '/imports/ui/components/video-provider/stream-sorting';
import {
  useVideoState,
  setVideoState,
  useConnectingStream,
  streams,
  getVideoState,
} from '../state';
import {
  OWN_VIDEO_STREAMS_QUERY,
  VIDEO_STREAMS_USERS_SUBSCRIPTION,
  VIEWERS_IN_WEBCAM_COUNT_SUBSCRIPTION,
  VideoStreamsUsersResponse,
} from '../queries';
import videoService from '../service';
import { CAMERA_BROADCAST_STOP } from '../mutations';

const ROLE_MODERATOR = window.meetingClientSettings.public.user.role_moderator;
const ROLE_VIEWER = window.meetingClientSettings.public.user.role_viewer;
const MIRROR_WEBCAM = window.meetingClientSettings.public.app.mirrorOwnWebcam;
const {
  paginationToggleEnabled: PAGINATION_TOGGLE_ENABLED,
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

export const useFetchedVideoStreams = () => {
  const { streams: s } = useStreams();
  let streams = [...s];
  const connectingStream = useConnectingStream(streams);
  const isPaginationEnabled = useIsPaginationEnabled();
  const isPaginationDisabled = !isPaginationEnabled;

  const { viewParticipantsWebcams } = Settings.dataSaving;
  if (!viewParticipantsWebcams) streams = videoService.filterLocalOnly(streams);

  if (connectingStream) {
    streams.push(connectingStream);
  }
  const pages = useVideoPage(streams);

  if (!isPaginationDisabled) {
    return pages;
  }

  return streams;
};

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

export const useRole = (isLocal: boolean) => {
  return isLocal ? 'share' : 'viewer';
};

export const useMyStreamId = (deviceId: string) => {
  const { streams } = useStreams();
  const videoStream = streams.find(
    (vs) => vs.userId === Auth.userID && vs.deviceId === deviceId,
  );
  return videoStream ? videoStream.stream : null;
};

export const useIsUserLocked = () => {
  const disableCam = useDisableCam();
  const { data: currentUser } = useCurrentUser((u) => ({
    locked: u.locked,
    isModerator: u.isModerator,
  }));
  return currentUser?.locked && !currentUser.isModerator && disableCam;
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

export const useMirrorOwnWebcam = (userId = null) => {
  // only true if setting defined and video ids match
  const isOwnWebcam = userId ? Auth.userID === userId : true;
  const isEnabledMirroring = getFromUserSettings(
    'bbb_mirror_own_webcam',
    MIRROR_WEBCAM,
  );
  return isOwnWebcam && isEnabledMirroring;
};

export const useHasCapReached = () => {
  const { data: meeting } = useMeeting((m) => ({
    meetingCameraCap: m.meetingCameraCap,
    usersPolicies: {
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

  const meetingCap = meetingCameraCap !== 0 && videoStreamsCount >= meetingCameraCap;
  const userCap = userCameraCap !== 0 && localVideoStreamsCount >= userCameraCap;

  return meetingCap || userCap;
};

export const useWebcamsOnlyForModerator = () => {
  const { data: meeting } = useMeeting((m) => ({
    usersPolicies: {
      webcamsOnlyForModerator: m.usersPolicies?.webcamsOnlyForModerator,
    },
  }));
  const user = Users.findOne(
    { userId: Auth.userID },
    { fields: { locked: 1, role: 1 } },
  );

  if (meeting?.usersPolicies && user?.role !== ROLE_MODERATOR && user?.locked) {
    return meeting.usersPolicies.webcamsOnlyForModerator;
  }
  return false;
};

export const useDisableCam = () => {
  const { data: meeting } = useMeeting((m) => ({
    lockSettings: {
      disableCam: m.lockSettings?.disableCam,
    },
  }));
  return meeting?.lockSettings ? meeting?.lockSettings.disableCam : false;
};

export const useVideoPinByUser = (userId: string) => {
  const user = Users.findOne({ userId }, { fields: { pin: 1 } });

  return user?.pin || false;
};

export const useSetNumberOfPages = (
  numberOfPublishers: number,
  numberOfSubscribers: number,
  pageSize: number,
) => {
  let { currentVideoPageIndex, numberOfPages } = useVideoState()[0];

  useEffect(() => {
    // Page size 0 means no pagination, return itself
    if (pageSize === 0) return;

    // Page size refers only to the number of subscribers. Publishers are always
    // shown, hence not accounted for
    const nOfPages = Math.ceil(numberOfSubscribers / pageSize);

    if (nOfPages !== numberOfPages) {
      numberOfPages = nOfPages;
      // Check if we have to page back on the current video page index due to a
      // page ceasing to exist
      if (nOfPages === 0) {
        currentVideoPageIndex = 0;
      } else if (currentVideoPageIndex + 1 > numberOfPages) {
        videoService.getPreviousVideoPage();
      }

      videoService.numberOfPages = nOfPages;
      videoService.currentVideoPageIndex = currentVideoPageIndex;
      setVideoState((curr) => ({
        ...curr,
        numberOfPages,
        currentVideoPageIndex,
      }));
    }
  }, [numberOfPublishers, numberOfSubscribers, pageSize, currentVideoPageIndex, numberOfPages]);

  return null;
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
    threshold = {
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
      size = pageSizes.moderator;
      break;
    case ROLE_VIEWER:
    default:
      size = pageSizes.viewer;
  }

  return size;
};

export const useShouldRenderPaginationToggle = () => PAGINATION_TOGGLE_ENABLED && useMyPageSize() > 0;

export const useIsPaginationEnabled = (paginationEnabled) => paginationEnabled && useMyPageSize() > 0;

export const useStreams = () => {
  const videoStreams = useReactiveVar(streams);
  return { streams: videoStreams };
};

export const useStreamUsers = () => {
  const { data, loading, error } = useSubscription<VideoStreamsUsersResponse>(
    VIDEO_STREAMS_USERS_SUBSCRIPTION,
  );
  const users = useMemo(
    () => (data
      ? data.user.map((user) => ({
        ...user,
        pin: user.pinned,
        sortName: user.nameSortable,
      }))
      : []),
    [data],
  );

  return {
    users: users || [],
    loading,
    error,
  };
};

export const useSharedDevices = () => {
  const { streams } = useStreams();
  const devices = streams
    .filter((s) => s.userId === Auth.userID)
    .map((vs) => vs.deviceId);

  return devices;
};

export const useUserIdsFromVideoStreams = () => {
  const { streams } = useStreams();
  return streams.map((s) => s.userId);
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

export const useVideoPage = (streams) => {
  const numberOfPages = useNumberOfPages();
  const currentVideoPageIndex = useCurrentVideoPageIndex();
  const pageSize = useMyPageSize();

  // Publishers are taken into account for the page size calculations. They
  // also appear on every page. Same for pinned user.
  const [filtered, others] = partition(
    streams,
    (vs) => Auth.userID === vs.userId || vs.pin,
  );

  // Separate pin from local cameras
  const [pin, mine] = partition(filtered, (vs) => vs.pin);

  // Recalculate total number of pages
  useSetNumberOfPages(filtered.length, others.length, pageSize);
  const chunkIndex = currentVideoPageIndex * pageSize;

  // This is an extra check because pagination is globally in effect (hard
  // limited page sizes, toggles on), but we might still only have one page.
  // Use the default sorting method if that's the case.
  const sortingMethod = numberOfPages > 1 ? PAGINATION_SORTING : DEFAULT_SORTING;
  const paginatedStreams = sortVideoStreams(others, sortingMethod).slice(
    chunkIndex,
    chunkIndex + pageSize,
  ) || [];

  if (getSortingMethod(sortingMethod).localFirst) {
    return [...pin, ...mine, ...paginatedStreams];
  }
  return [...pin, ...paginatedStreams, ...mine];
};

export const useVideoStreams = (
  isGridEnabled: boolean,
  paginationEnabled: boolean,
  viewParticipantsWebcams: boolean,
) => {
  const [state] = useVideoState();
  const { currentVideoPageIndex, numberOfPages } = state;
  const { users } = useStreamUsers();
  const { streams: videoStreams} = useStreams();
  const connectingStream = useConnectingStream(videoStreams);
  const gridSize = useGridSize();
  const myPageSize = useMyPageSize();
  const isPaginationEnabled = useIsPaginationEnabled(paginationEnabled);
  let streams = [...videoStreams];
  let gridUsers = [];

  if (connectingStream) streams.push(connectingStream);

  if (!viewParticipantsWebcams) {
    streams = streams.filter((stream) => stream.userId === Auth.userID);
  }

  if (isPaginationEnabled) {
    const [filtered, others] = partition(streams, (vs) => Auth.userID === vs.userId || vs.pin);
    const [pin, mine] = partition(filtered, (vs) => vs.pin);

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

  if (isGridEnabled) {
    const streamUsers = streams.map((stream) => stream.userId);

    gridUsers = users
      .filter(
        (user) => !user.loggedOut && !user.left && !streamUsers.includes(user.userId),
      )
      .map((user) => ({
        isGridItem: true,
        ...user,
      }))
      .slice(0, gridSize - streams.length);
  }

  return {
    streams,
    gridUsers,
    totalNumberOfStreams: streams.length,
    users,
  };
};

export const useGridUsers = (users = []) => {
  const pageSize = useMyPageSize();
  const { streams } = useStreams();
  const paginatedStreams = useVideoPage(streams, pageSize);
  const isPaginationEnabled = useIsPaginationEnabled();
  const isPaginationDisabled = !isPaginationEnabled || pageSize === 0;
  const isGridEnabled = videoService.isGridEnabled();
  let gridUsers = [];

  if (isPaginationDisabled) {
    if (isGridEnabled) {
      const streamUsers = streams.map((stream) => stream.userId);

      gridUsers = users
        .filter(
          (user) => !user.loggedOut && !user.left && !streamUsers.includes(user.userId),
        )
        .map((user) => ({
          isGridItem: true,
          ...user,
        }));
    }

    return gridUsers;
  }

  if (isGridEnabled) {
    const streamUsers = paginatedStreams.map((stream) => stream.userId);

    gridUsers = users
      .filter(
        (user) => !user.loggedOut && !user.left && !streamUsers.includes(user.userId),
      )
      .map((user) => ({
        isGridItem: true,
        ...user,
      }));
  }
  return gridUsers;
};

export const useHasVideoStream = () => {
  const { streams } = useStreams();
  return streams.some((s) => s.userId === Auth.userID);
};

export const useHasStream = (streams, stream) => {
  return streams.find((s) => s.stream === stream);
};

export const useFilterModeratorOnly = (streams) => {
  const amIViewer = useMyRole() === ROLE_VIEWER;

  if (amIViewer) {
    const moderators = Users.find(
      {
        role: ROLE_MODERATOR,
      },
      { fields: { userId: 1 } },
    )
      .fetch()
      .map((user) => user.userId);

    return streams.reduce((result, stream) => {
      const { userId } = stream;

      const isModerator = moderators.includes(userId);
      const isMe = Auth.userID === userId;

      if (isModerator || isMe) result.push(stream);

      return result;
    }, []);
  }
  return streams;
};

export const useExitVideo = () => {
  const [cameraBroadcastStop] = useMutation(CAMERA_BROADCAST_STOP);
  const [getOwnVideoStreams] = useLazyQuery(OWN_VIDEO_STREAMS_QUERY, { variables: { userId: Auth.userID } });

  const exitVideo = useCallback(() => {
    const { isConnected } = getVideoState();

    if (isConnected) {
      const sendUserUnshareWebcam = (cameraId: string) => {
        cameraBroadcastStop({ variables: { cameraId } });
      };

      getOwnVideoStreams().then(({ data }) => {
        if (!data) return;
        const streams = data.user_camera || [];
        streams.forEach((s) => sendUserUnshareWebcam(s.streamId));
        videoService.exitedVideo();
      });
    }
  }, [cameraBroadcastStop]);

  return exitVideo;
};

export const useViewersInWebcamCount = () => {
  const { data } = useSubscription(VIEWERS_IN_WEBCAM_COUNT_SUBSCRIPTION);
  return data?.user_camera_aggregate?.aggregate?.count || 0;
};
