import {
  useCallback,
  useEffect,
  useRef,
} from 'react';
import {
  useReactiveVar,
  useLazyQuery,
  useMutation,
  useSubscription,
} from '@apollo/client';
import Auth from '/imports/ui/services/auth';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { partition } from '/imports/utils/array-utils';
import { USER_AGGREGATE_COUNT_SUBSCRIPTION, UsersCountSubscriptionResponse } from '/imports/ui/core/graphql/queries/users';
import {
  getSortingMethod,
  sortVideoStreams,
} from '/imports/ui/components/video-provider/stream-sorting';
import {
  useVideoState,
  getConnectingStream,
  setVideoState,
  useConnectingStream,
  getVideoState,
} from '/imports/ui/components/video-provider/state';
import {
  OWN_VIDEO_STREAMS_QUERY,
  GRID_USERS_SUBSCRIPTION,
  VIEWERS_IN_WEBCAM_COUNT_SUBSCRIPTION,
  VIDEO_STREAMS_SUBSCRIPTION,
  AUDIO_ONLY_USERS_SUBSCRIPTION,
  ViewerVideoStreamsSubscriptionResponse,
  AudioOnlyUsersResponse,
} from '/imports/ui/components/video-provider/queries';
import videoService from '/imports/ui/components/video-provider/service';
import { CAMERA_BROADCAST_STOP } from '/imports/ui/components/video-provider/mutations';
import {
  GridItem,
  StreamItem,
  AudioOnlyStream,
  GridUsersResponse,
  OwnVideoStreamsResponse,
  StreamSubscriptionData,
} from '/imports/ui/components/video-provider/types';
import { DesktopPageSizes, MobilePageSizes } from '/imports/ui/Types/meetingClientSettings';
import logger from '/imports/startup/client/logger';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';
import { useStorageKey } from '/imports/ui/services/storage/hooks';
import ConnectionStatus from '/imports/ui/core/graphql/singletons/connectionStatus';
import { VIDEO_TYPES } from '/imports/ui/components/video-provider/enums';
import { layoutSelect } from '/imports/ui/components/layout/context';
import { Layout } from '/imports/ui/components/layout/layoutTypes';
import { LAYOUT_TYPE } from '/imports/ui/components/layout/enums';
import createUseSubscription from '/imports/ui/core/hooks/createUseSubscription';
import { filterByMeetingId } from '/imports/ui/core/utils/subscriptionFilters';
import {
  MEDIA_GROUP_STREAMS_SUBSCRIPTION,
} from '/imports/ui/components/livekit/selective-subscription/queries';
import {
  MediaGroupParticipant,
  MediaType,
  PUBLIC_GROUP_IDS,
} from '/imports/ui/components/livekit/selective-subscription/types';

const useVideoStreamsSubscription = createUseSubscription(
  VIDEO_STREAMS_SUBSCRIPTION,
  {},
  true,
);

export const useStreams = () => {
  const { data: meeting } = useMeeting((m) => ({ meetingId: m.meetingId }));
  const { data, loading, errors } = useVideoStreamsSubscription();

  if (loading) return [];

  if (errors) {
    errors.forEach((error) => {
      logger.error({
        logCode: 'video_stream_sub_error',
        extraInfo: {
          errorMessage: error.message,
        },
      }, 'Video streams subscription failed.');
    });
  }

  const filteredStreams = meeting?.meetingId
    ? filterByMeetingId(
      data as StreamSubscriptionData[],
      meeting.meetingId,
      VIDEO_STREAMS_SUBSCRIPTION,
      (s) => ({ mismatchedUserId: s.user?.userId, mismatchedName: s.user?.name }),
    )
    : [];

  const mappedStreams = filteredStreams.map(({ streamId, user, voice }) => {
    if (!streamId) {
      logger.warn({
        logCode: 'missing_stream_id',
        extraInfo: {
          userId: user?.userId || '',
          role: user?.role || '',
          clientType: user?.clientType || '',
        },
      }, 'Stream entry has no streamId.');
    }

    return {
      stream: streamId ?? '',
      deviceId: streamId?.split?.('_')?.[3] ?? '',
      name: user?.name || '',
      nameSortable: user?.nameSortable || '',
      userId: user?.userId || '',
      user,
      floor: voice?.floor ?? false,
      lastFloorTime: voice?.lastFloorTime ?? '0',
      voice,
      type: VIDEO_TYPES.STREAM,
    };
  });

  return mappedStreams.length > 0 ? mappedStreams : [];
};

export const useStatus = () => {
  const { isConnected, isConnecting } = useVideoState();
  if (isConnecting) return 'videoConnecting';
  if (isConnected) return 'connected';
  return 'disconnected';
};

export const useDisableReason = () => {
  const videoLocked = useIsUserLocked();
  const hasCapReached = useHasCapReached();
  const hasVideoStream = useHasVideoStream();
  const connected = useReactiveVar(ConnectionStatus.getConnectedStatusVar());
  const locks = {
    videoLocked,
    camCapReached: hasCapReached && !hasVideoStream,
    disconnected: !connected,
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
  const streams = useStreams();

  return streams.length;
};

export const useLocalVideoStreamsCount = () => {
  const streams = useStreams();
  const localStreams = streams.filter((vs) => videoService.isLocalStream(vs.stream));

  return localStreams.length;
};

export const useInfo = () => {
  const { data } = useMeeting((m) => ({
    voiceSettings: m.voiceSettings,
  }));
  const voiceBridge = data?.voiceSettings ? data.voiceSettings.voiceConf : null;
  return {
    userId: Auth.userID as string,
    userName: Auth.fullname as string,
    meetingId: Auth.meetingID as string,
    sessionToken: Auth.sessionToken as string,
    voiceBridge,
  };
};

export const useHasCapReached = () => {
  const { data: meeting } = useMeeting((m) => ({
    meetingCameraCap: m.meetingCameraCap,
    usersPolicies: m.usersPolicies,
  }));
  const videoStreamsCount = useVideoStreamsCount();
  const localVideoStreamsCount = useLocalVideoStreamsCount();

  // If the meeting prop data is unreachable, force a safe return
  if (
    meeting?.usersPolicies === undefined
    || meeting?.meetingCameraCap === undefined
  ) return true;
  const { meetingCameraCap } = meeting;
  const { userCameraCap } = meeting.usersPolicies;

  const meetingCap = meetingCameraCap !== 0 && videoStreamsCount >= (meetingCameraCap as number);
  const userCap = userCameraCap !== 0 && localVideoStreamsCount >= userCameraCap;

  return meetingCap || userCap;
};

export const useDisableCam = () => {
  const { data: meeting } = useMeeting((m) => ({
    lockSettings: m.lockSettings,
  }));
  return meeting?.lockSettings ? meeting?.lockSettings.disableCam : false;
};

const getCountData = () => {
  const { data: countData } = useDeduplicatedSubscription<UsersCountSubscriptionResponse>(
    USER_AGGREGATE_COUNT_SUBSCRIPTION,
  );
  return countData?.user_aggregate?.aggregate?.count || 0;
};

export const usePageSizeDictionary = () => {
  const {
    desktopPageSizes: DESKTOP_PAGE_SIZES,
    mobilePageSizes: MOBILE_PAGE_SIZES,
  } = window.meetingClientSettings.public.kurento.pagination;
  const userCount = getCountData();

  const PAGINATION_THRESHOLDS_CONF = window.meetingClientSettings.public.kurento.paginationThresholds;
  const PAGINATION_THRESHOLDS_ENABLED = PAGINATION_THRESHOLDS_CONF.enabled;
  const PAGINATION_THRESHOLDS = PAGINATION_THRESHOLDS_CONF.thresholds.sort(
    (t1, t2) => t1.users - t2.users,
  );

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
  const ROLE_MODERATOR = videoService.getRoleModerator();
  const ROLE_VIEWER = videoService.getRoleViewer();
  let size;
  switch (myRole) {
    case ROLE_MODERATOR:
      size = pageSizes?.moderator;
      break;
    case ROLE_VIEWER:
    default:
      size = pageSizes?.viewer;
  }

  const actualSize = size ?? 0;

  useEffect(() => {
    setVideoState({ pageSize: actualSize });
  }, [actualSize]);

  return actualSize;
};

export const useIsPaginationEnabled = () => {
  const myPageSize = useMyPageSize();
  const { paginationEnabled } = useSettings(SETTINGS.APPLICATION) as { paginationEnabled?: boolean };
  return myPageSize > 0 && paginationEnabled;
};

export const useGridUsers = (visibleStreamCount: number) => {
  const gridSize = useGridSize();
  const userCount = getCountData();
  const isGridEnabled = useStorageKey('isGridEnabled');
  const gridItems = useRef<GridItem[]>([]);
  const overflowCount = useRef<number>(0);

  const { data: meeting } = useMeeting((m) => ({
    meetingId: m.meetingId,
  }));

  const {
    data: gridData,
    error: gridError,
    loading: gridLoading,
  } = useSubscription<GridUsersResponse>(
    GRID_USERS_SUBSCRIPTION,
    {
      variables: { limit: Math.max(gridSize - visibleStreamCount, 0) },
      skip: !isGridEnabled,
    },
  );

  if (gridLoading) return { gridUsers: gridItems.current, overflowCount: overflowCount.current };

  if (gridError) {
    logger.error({
      logCode: 'grid_users_sub_error',
      extraInfo: {
        errorName: gridError.name,
        errorMessage: gridError.message,
      },
    }, 'Grid users subscription failed.');
  }

  if (gridData && meeting?.meetingId) {
    const filteredUsers = filterByMeetingId(
      gridData.user,
      meeting.meetingId,
      GRID_USERS_SUBSCRIPTION,
      (u) => ({ mismatchedUserId: u.userId, mismatchedName: u.name }),
    );
    const newGridUsers = filteredUsers.map((user) => ({
      ...user,
      type: VIDEO_TYPES.GRID,
    }));
    gridItems.current = newGridUsers;

    const overflow = Math.max(userCount - gridSize, 0);

    // if there's overflow, we replace the last grid user with the overflow tile,
    // so we need to add 1 to the overflow count to account for the replaced user
    overflowCount.current = overflow > 0 ? overflow + 1 : 0;
  } else {
    gridItems.current = [];
    overflowCount.current = 0;
  }

  return { gridUsers: gridItems.current, overflowCount: overflowCount.current };
};

export const useSharedDevices = () => {
  const streams = useStreams();
  const devices = streams
    .filter((s) => videoService.isLocalStream(s.stream))
    .map((vs) => vs.deviceId);

  return devices;
};

export const useNumberOfPages = () => {
  const { numberOfPages } = useVideoState();
  return numberOfPages;
};

export const useCurrentVideoPageIndex = () => {
  const { currentVideoPageIndex } = useVideoState();
  return currentVideoPageIndex;
};

export const useGridSize = () => {
  let size;
  const myRole = useMyRole();
  const ROLE_MODERATOR = videoService.getRoleModerator();
  const ROLE_VIEWER = videoService.getRoleViewer();
  const {
    desktopGridSizes: DESKTOP_GRID_SIZES,
    mobileGridSizes: MOBILE_GRID_SIZES,
  } = window.meetingClientSettings.public.kurento.pagination;

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

const useAudioOnlySubscription = createUseSubscription(
  AUDIO_ONLY_USERS_SUBSCRIPTION,
  {},
  true,
);

const useMediaGroupStreamsSubscription = createUseSubscription(
  MEDIA_GROUP_STREAMS_SUBSCRIPTION,
  {},
  true,
);

export const useAudioOnlyUsers = (): AudioOnlyStream[] => {
  const { data: meeting } = useMeeting((m) => ({ meetingId: m.meetingId }));
  const { data, loading, errors } = useAudioOnlySubscription();
  const layoutType = layoutSelect((i: Layout) => i.layoutType);
  const {
    showAudioOnlyOnFirstPage,
  } = window.meetingClientSettings.public.kurento.cameraSortingModes;

  const isUnifiedLayout = layoutType === LAYOUT_TYPE.UNIFIED_LAYOUT;

  if (!showAudioOnlyOnFirstPage || !isUnifiedLayout) return [];
  if (loading) return [];

  if (errors) {
    errors.forEach((error) => {
      logger.error({
        logCode: 'audio_only_users_sub_error',
        extraInfo: {
          errorMessage: error.message,
        },
      }, 'Audio-only users subscription failed.');
    });
  }

  const filteredUsers = meeting?.meetingId
    ? filterByMeetingId(
      data as AudioOnlyUsersResponse['user'],
      meeting.meetingId,
      AUDIO_ONLY_USERS_SUBSCRIPTION,
      (u) => ({ mismatchedUserId: u.userId, mismatchedName: u.name }),
    )
    : [];

  const mappedAudioStreams: AudioOnlyStream[] = filteredUsers
    .filter((u) => u.voice && u.voice.joined && !u.voice.listenOnly)
    .map((user) => ({
      stream: `audio-only-${user.userId}`,
      name: user.name || '',
      nameSortable: user.nameSortable || '',
      userId: user.userId || '',
      user,
      floor: user.voice?.floor ?? false,
      lastFloorTime: user.voice?.lastFloorTime ?? '0',
      voice: user.voice!,
      type: VIDEO_TYPES.AUDIO_ONLY,
    }));

  return mappedAudioStreams;
};

const useVideoSenders = () => {
  const { data, errors } = useMediaGroupStreamsSubscription();

  if (errors) {
    errors.forEach((error) => {
      logger.error({
        logCode: 'video_provider_media_group_sub_error',
        extraInfo: {
          errorMessage: error.message,
          mediaType: MediaType.CAMERA,
        },
      }, `VideoProvider: ${MediaType.CAMERA} group participants subscription failed.`);
    });
  }

  const mediaGroupParticipants = (data as MediaGroupParticipant[] || []).filter(
    (mgp) => mgp.mediaType === MediaType.CAMERA,
  );

  // Groups where I am a receiver - I see the union of senders from all of these
  const myInboundGroupIds = mediaGroupParticipants.filter(
    (mgp) => mgp.userId === Auth.userID && mgp.receiver === true,
  ).map((mgp) => mgp.groupId);

  const inAnyGroup = myInboundGroupIds.length > 0;

  // No explicit group membership = treat as public receiver.
  // Public receivers receive from: groupless senders + public group senders.
  // Exclude only senders in non-public mediaGroupParticipants.
  if (!inAnyGroup) {
    const senderIdsInPublicGroup = new Set(mediaGroupParticipants
      .filter((mgp) => mgp.sender === true && mgp.active
        && mgp.groupId === PUBLIC_GROUP_IDS[MediaType.CAMERA])
      .map((mgp) => mgp.userId));
    const senderIdsInNonPublicGroups = new Set(mediaGroupParticipants
      .filter((mgp) => mgp.sender === true && mgp.active
        && mgp.groupId !== PUBLIC_GROUP_IDS[MediaType.CAMERA])
      .map((mgp) => mgp.userId));
    // Exclude only senders who are active in non-public groups but NOT in the public group.
    // Users concurrently sending in both public and non-public groups should still be
    // visible to public receivers.
    const senderIdsOnlyInNonPublic = new Set(
      [...senderIdsInNonPublicGroups].filter((id) => !senderIdsInPublicGroup.has(id)),
    );

    return { senderIds: null, senderIdsInGroups: senderIdsOnlyInNonPublic, inAnyGroup: false };
  }

  // Union of senders from all mediaGroupParticipants where I am a receiver (public + explicit groups)
  const senderIds = new Set(mediaGroupParticipants
    .filter((mgp) => myInboundGroupIds.includes(mgp.groupId))
    .filter((participant) => participant.sender === true && participant.active)
    .map((participant) => participant.userId));

  return { senderIds, senderIdsInGroups: null, inAnyGroup: true };
};

// Paginates `others` (camera streams) and reserves first-page slots for audio-only
// tiles (camera-less users that hold the audio floor). Shared by both pagination modes
// so attendees and moderators surface audio-only tiles consistently (issue 25242).
// `reservedCount` is the number of always-on-page privileged streams (pinned + local
// cameras), which is 0 when streams are paginated equally (!partitionPrivilegedStreams).
const reserveAudioOnlyTiles = ({
  others,
  sortingMethod,
  audioOnlyUsers,
  excludeStreams,
  pageSize,
  currentVideoPageIndex,
  chunkIndex,
  maxAudioOnlyUsers,
  showAudioOnlyOnFirstPage,
  reservedCount,
}: {
  others: StreamItem[];
  sortingMethod: string;
  audioOnlyUsers: AudioOnlyStream[];
  excludeStreams: StreamItem[];
  pageSize: number;
  currentVideoPageIndex: number;
  chunkIndex: number;
  maxAudioOnlyUsers: number;
  showAudioOnlyOnFirstPage: boolean;
  reservedCount: number;
}): { paginatedStreams: StreamItem[]; audioOnlyStreams: StreamItem[]; totalNumberOfOtherStreams: number } => {
  const availableSlots = Math.max(0, pageSize - reservedCount);
  const uniqueAudioOnly = (showAudioOnlyOnFirstPage && audioOnlyUsers.length > 0)
    ? audioOnlyUsers.filter((audioUser) => !excludeStreams.find((s) => s.userId === audioUser.userId))
    : [];
  const audioOnlySlotsUsedOnPage1 = uniqueAudioOnly.length > 0
    ? Math.min(uniqueAudioOnly.length, Math.min(availableSlots, maxAudioOnlyUsers))
    : 0;

  let totalNumberOfOtherStreams: number;
  if (audioOnlySlotsUsedOnPage1 > 0 && reservedCount > 0) {
    // Privileged streams occupy slots on every page, so audio-only tiles on page 1 push
    // remote cameras to later pages — size the page count accordingly.
    const othersOnPage0 = Math.max(0, pageSize - reservedCount - audioOnlySlotsUsedOnPage1);
    const remainingOthers = Math.max(0, others.length - othersOnPage0);
    const additionalPages = remainingOthers > 0 ? Math.ceil(remainingOthers / pageSize) : 0;
    totalNumberOfOtherStreams = (1 + additionalPages) * pageSize;
  } else {
    totalNumberOfOtherStreams = others.length + audioOnlySlotsUsedOnPage1;
  }

  // Page 1 reserves slots for the audio-only tiles, so later pages start after the
  // remote cameras already shown on the first page.
  const effectiveChunkIndex = currentVideoPageIndex > 0 && audioOnlySlotsUsedOnPage1 > 0
    ? Math.max(0, pageSize - reservedCount - audioOnlySlotsUsedOnPage1) + (currentVideoPageIndex - 1) * pageSize
    : chunkIndex;

  let paginatedStreams = sortVideoStreams(others, sortingMethod)
    .slice(effectiveChunkIndex, effectiveChunkIndex + pageSize);

  let audioOnlyStreams: StreamItem[] = [];
  if (currentVideoPageIndex === 0 && audioOnlySlotsUsedOnPage1 > 0) {
    const audioOnlyToAdd = uniqueAudioOnly.slice(0, audioOnlySlotsUsedOnPage1);
    if (paginatedStreams.length + audioOnlyToAdd.length > availableSlots) {
      paginatedStreams = paginatedStreams.slice(0, Math.max(0, availableSlots - audioOnlyToAdd.length));
    }
    audioOnlyStreams = audioOnlyToAdd;
  }

  return { paginatedStreams, audioOnlyStreams, totalNumberOfOtherStreams };
};

export const useVideoStreams = () => {
  const { viewParticipantsWebcams } = useSettings(SETTINGS.DATA_SAVING) as { viewParticipantsWebcams?: boolean };
  const { currentVideoPageIndex, numberOfPages } = useVideoState();
  const videoStreams = useStreams();
  const connectingStream = useConnectingStream(videoStreams);
  const audioOnlyUsers = useAudioOnlyUsers();
  const myPageSize = useMyPageSize();
  const isPaginationEnabled = useIsPaginationEnabled();
  const { senderIds, senderIdsInGroups, inAnyGroup } = useVideoSenders();
  let streams: StreamItem[] = [...videoStreams];
  let totalNumberOfOtherStreams: number | undefined;

  const layoutType = layoutSelect((i: Layout) => i.layoutType);
  const isUnifiedLayout = layoutType === LAYOUT_TYPE.UNIFIED_LAYOUT;
  const {
    paginationSorting: PAGINATION_SORTING,
    defaultSorting: DEFAULT_SORTING,
    showAudioOnlyOnFirstPage: showAudioOnlyOnFirstPageSetting,
    maxAudioOnlyUsers: maxAudioOnlyUsersSetting,
    partitionPrivilegedStreams,
  } = window.meetingClientSettings.public.kurento.cameraSortingModes;

  const showAudioOnlyOnFirstPage = showAudioOnlyOnFirstPageSetting && isUnifiedLayout;
  const maxAudioOnlyUsers = isUnifiedLayout ? maxAudioOnlyUsersSetting : 0;

  if (connectingStream) streams.push(connectingStream);

  if (!viewParticipantsWebcams) {
    streams = streams.filter((vs) => videoService.isLocalStream(vs.stream));
  } else if (inAnyGroup) {
    streams = streams.filter((vs) => videoService.isLocalStream(vs.stream)
      || (senderIds?.has(vs.userId)));
  } else if (senderIdsInGroups) {
    streams = streams.filter((vs) => videoService.isLocalStream(vs.stream)
      || !senderIdsInGroups.has(vs.userId));
  }

  if (isPaginationEnabled) {
    const chunkIndex = currentVideoPageIndex * myPageSize;
    const sortingMethod = (numberOfPages > 1) ? PAGINATION_SORTING : DEFAULT_SORTING;
    const sortingConfig = getSortingMethod(sortingMethod);

    if (!partitionPrivilegedStreams) {
      // Paginate all streams equally — local/pinned cameras only appear on their own page.
      const { paginatedStreams, audioOnlyStreams, totalNumberOfOtherStreams: total } = reserveAudioOnlyTiles({
        others: streams,
        sortingMethod,
        audioOnlyUsers,
        excludeStreams: streams,
        pageSize: myPageSize,
        currentVideoPageIndex,
        chunkIndex,
        maxAudioOnlyUsers,
        showAudioOnlyOnFirstPage,
        reservedCount: 0,
      });
      totalNumberOfOtherStreams = total;

      // Keep local cameras that fell off the current page publishing (render: false).
      const localStreamsWithRenderFlag = streams
        .filter((vs) => videoService.isLocalStream(vs.stream)
          && !paginatedStreams.find((ps) => ps.stream === vs.stream))
        .map((stream) => ({ ...stream, render: false }));

      streams = [...paginatedStreams, ...audioOnlyStreams, ...localStreamsWithRenderFlag];
    } else {
      // Show pinned/local cameras on every page; paginate the remaining (other) streams.
      const [filtered, others] = partition(
        streams,
        (vs: StreamItem) => videoService.isLocalStream(vs.stream)
          || (vs.type === VIDEO_TYPES.STREAM && vs.user?.pinned),
      );
      const [pin, mine] = partition(
        filtered,
        (vs: StreamItem) => vs.type === VIDEO_TYPES.STREAM && vs.user?.pinned,
      );

      const { paginatedStreams, audioOnlyStreams, totalNumberOfOtherStreams: total } = reserveAudioOnlyTiles({
        others,
        sortingMethod,
        audioOnlyUsers,
        excludeStreams: streams,
        pageSize: myPageSize,
        currentVideoPageIndex,
        chunkIndex,
        maxAudioOnlyUsers,
        showAudioOnlyOnFirstPage,
        reservedCount: pin.length + mine.length,
      });
      totalNumberOfOtherStreams = total;

      if (sortingConfig.localFirst) {
        streams = [...pin, ...mine, ...paginatedStreams, ...audioOnlyStreams];
      } else {
        streams = [...pin, ...paginatedStreams, ...mine, ...audioOnlyStreams];
      }
    }
  } else {
    streams = sortVideoStreams(streams, DEFAULT_SORTING);

    // Add up to maxAudioOnlyUsers when pagination is disabled
    if (showAudioOnlyOnFirstPage && audioOnlyUsers.length > 0) {
      const uniqueAudioOnly = audioOnlyUsers.filter(
        (audioUser) => !streams.find((s) => s.userId === audioUser.userId),
      );

      if (uniqueAudioOnly.length > 0) {
        const audioOnlyToAdd = uniqueAudioOnly.slice(0, maxAudioOnlyUsers);
        streams = [...streams, ...audioOnlyToAdd];
      }
    }
  }

  const { gridUsers, overflowCount } = useGridUsers(streams.length);

  return {
    streams,
    gridUsers: gridUsers.filter((u) => !streams.find((s) => s.userId === u.userId)),
    overflowCount,
    totalNumberOfStreams: streams.length,
    totalNumberOfOtherStreams,
  };
};

export const useHasVideoStream = () => {
  const streams = useStreams();
  const connectingStream = useConnectingStream();
  return !!connectingStream || streams.some((s) => videoService.isLocalStream(s.stream));
};

const useOwnVideoStreamsQuery = () => useLazyQuery<OwnVideoStreamsResponse>(
  OWN_VIDEO_STREAMS_QUERY,
  {
    variables: {
      userId: Auth.userID,
      streamIdPrefix: `${videoService.getPrefix()}%`,
    },
    // UID and prefix are stable, so for now we need to bust the cache. If we don't,
    // users will hit issues where cannot unshare their webcam or unsharing deals
    // with unexpected behavior. E.g.: a camera was first ejected server side (empty
    // stream list), or multiple cameras were shared (just the first one is cached).
    fetchPolicy: 'no-cache',
  },
);

export const useExitVideo = (forceExit = false) => {
  const [cameraBroadcastStop] = useMutation(CAMERA_BROADCAST_STOP);
  const [getOwnVideoStreams] = useOwnVideoStreamsQuery();

  const exitVideo = useCallback(async () => {
    const { isConnected } = getVideoState();

    if (isConnected || forceExit) {
      const sendUserUnshareWebcam = (cameraId: string) => {
        return cameraBroadcastStop({ variables: { cameraId } });
      };

      return getOwnVideoStreams().then(async ({ data }) => {
        if (data) {
          const streams = data.user_camera || [];
          const results = streams.map((s) => sendUserUnshareWebcam(s.streamId));

          return Promise.all(results).then(() => {
            videoService.exitedVideo();
            return true;
          }).catch((e) => {
            logger.warn({
              logCode: 'exit_video_error',
              extraInfo: {
                errorMessage: e.message,
                errorStack: e.stack,
              },
            }, `Failed to exit video: ${e.message}`);
            return false;
          });
        }
        return true;
      });
    }
    return true;
  }, [cameraBroadcastStop]);

  return exitVideo;
};

export const useViewersInWebcamCount = (): number => {
  const { data } = useDeduplicatedSubscription<ViewerVideoStreamsSubscriptionResponse>(
    VIEWERS_IN_WEBCAM_COUNT_SUBSCRIPTION,
  );
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

  return useCallback(async (cameraId?: string) => {
    const { data } = await getOwnVideoStreams();
    const streams = data?.user_camera ?? [];
    const connectingStream = getConnectingStream();
    const hasTargetStream = streams.some((s) => s.streamId === cameraId);
    const hasOtherStream = streams.some((s) => s.streamId !== cameraId);

    if (hasTargetStream) {
      cameraBroadcastStop({ variables: { cameraId } });
    }

    if (!hasOtherStream && !connectingStream) {
      videoService.exitedVideo();
    } else {
      videoService.stopConnectingStream();
    }
  }, [cameraBroadcastStop]);
};

export const useShouldRenderPaginationToggle = () => {
  const myPageSize = useMyPageSize();
  const {
    paginationToggleEnabled: PAGINATION_TOGGLE_ENABLED,
  } = window.meetingClientSettings.public.kurento.pagination;

  return PAGINATION_TOGGLE_ENABLED && myPageSize > 0;
};

export const useIsVideoPinEnabledForCurrentUser = (isModerator: boolean) => {
  const isPinEnabled = videoService.isPinEnabled();

  return !!(isModerator && isPinEnabled);
};
