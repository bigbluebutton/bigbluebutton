import { StreamItem, VideoItem } from './types';
import UserListService from '/imports/ui/components/user-list/service';
import Auth from '/imports/ui/services/auth';
import VideoService from './service';
import { VIDEO_TYPES } from './enums';

const DEFAULT_SORTING_MODE = 'LOCAL_ALPHABETICAL';

export interface SortingMethodConfig {
  sortingMethod: (s1: StreamItem, s2: StreamItem, moderatorFirst?: boolean) => number;
  localFirst: boolean;
}

const getPinnedTime = (item: StreamItem): number => {
  if (item.type === VIDEO_TYPES.CONNECTING) return 0;
  return item.user?.pinnedTime ? new Date(item.user.pinnedTime).getTime() : 0;
};

const isStreamModerator = (item: StreamItem): boolean => {
  if (item.type === VIDEO_TYPES.CONNECTING) return false;
  return !!item.user?.isModerator;
};

// Orders two pinned streams. When moderatorFirst (viewers), moderators come ahead of
// non-moderators; otherwise — and as a tiebreak — the most recently pinned comes first.
const sortPinnedStreams = (s1: StreamItem, s2: StreamItem, moderatorFirst: boolean) => {
  if (moderatorFirst) {
    const m1 = isStreamModerator(s1);
    const m2 = isStreamModerator(s2);
    if (m1 !== m2) return m1 ? -1 : 1;
  }
  return getPinnedTime(s2) - getPinnedTime(s1);
};

// pin first (most recently pinned ahead), ignore connecting streams
export const sortPin = (s1: StreamItem, s2: StreamItem, moderatorFirst = false) => {
  if (s1.type === VIDEO_TYPES.CONNECTING) {
    return 0;
  }
  if (s2.type === VIDEO_TYPES.CONNECTING) {
    return 0;
  }
  if (s1.user?.pinned && s2.user?.pinned) {
    return sortPinnedStreams(s1, s2, moderatorFirst);
  }
  if (s1.user?.pinned) {
    return -1;
  } if (s2.user?.pinned) {
    return 1;
  }
  return 0;
};

export const mandatorySorting = (
  s1: StreamItem,
  s2: StreamItem,
  moderatorFirst = false,
) => sortPin(s1, s2, moderatorFirst);

// lastFloorTime (descending), ignore connecting streams
export const sortVoiceActivity = (s1: StreamItem, s2: StreamItem) => {
  if (s1.type === VIDEO_TYPES.CONNECTING) {
    return 0;
  }
  if (s2.type === VIDEO_TYPES.CONNECTING) {
    return 0;
  }
  if (s2.lastFloorTime < s1.lastFloorTime) {
    return -1;
  }
  if (s2.lastFloorTime > s1.lastFloorTime) {
    return 1;
  }
  return 0;
};

// pin -> lastFloorTime (descending) -> alphabetical -> local
export const sortVoiceActivityLocal = (s1: StreamItem, s2: StreamItem, moderatorFirst = false) => {
  if (s1.userId === Auth.userID) {
    return 1;
  } if (s2.userId === Auth.userID) {
    return -1;
  }

  return mandatorySorting(s1, s2, moderatorFirst)
    || sortVoiceActivity(s1, s2)
    || UserListService.sortUsersByName(s1, s2);
};

export const sortByLocal = (s1: StreamItem, s2: StreamItem) => {
  if (VideoService.isLocalStream(s1.stream)) {
    return -1;
  } if (VideoService.isLocalStream(s2.stream)) {
    return 1;
  }

  return 0;
};

// pin -> local -> lastFloorTime (descending) -> alphabetical
export const sortLocalVoiceActivity = (
  s1: StreamItem,
  s2: StreamItem,
  moderatorFirst = false,
) => mandatorySorting(s1, s2, moderatorFirst)
    || sortByLocal(s1, s2)
    || sortVoiceActivity(s1, s2)
    || UserListService.sortUsersByName(s1, s2);

// pin -> local -> alphabetic
export const sortLocalAlphabetical = (
  s1: StreamItem,
  s2: StreamItem,
  moderatorFirst = false,
) => mandatorySorting(s1, s2, moderatorFirst)
    || sortByLocal(s1, s2)
    || UserListService.sortUsersByName(s1, s2);

export const sortPresenter = (s1: StreamItem, s2: StreamItem) => {
  if (s1.type === VIDEO_TYPES.STREAM && s1.user.presenter) {
    return -1;
  }
  if (s2.type === VIDEO_TYPES.STREAM && s2.user.presenter) {
    return 1;
  }
  return 0;
};

// pin -> local -> presenter -> alphabetical
export const sortLocalPresenterAlphabetical = (
  s1: StreamItem,
  s2: StreamItem,
  moderatorFirst = false,
) => mandatorySorting(s1, s2, moderatorFirst)
    || sortByLocal(s1, s2)
    || sortPresenter(s1, s2)
    || UserListService.sortUsersByName(s1, s2);

export const sortByPinned = (s1: StreamItem, s2: StreamItem, moderatorFirst = false) => {
  const s1Pinned = s1.type === VIDEO_TYPES.STREAM && s1.user?.pinned;
  const s2Pinned = s2.type === VIDEO_TYPES.STREAM && s2.user?.pinned;
  if (s1Pinned && s2Pinned) {
    return sortPinnedStreams(s1, s2, moderatorFirst);
  }
  if (s1Pinned) {
    return -1;
  }
  if (s2Pinned) {
    return 1;
  }
  return 0;
};

// presenter -> local -> pinned -> alphabetical
export const sortPresenterLocalPinned = (s1: StreamItem, s2: StreamItem, moderatorFirst = false) => {
  // First, check if either is presenter
  const presenterSort = sortPresenter(s1, s2);
  if (presenterSort !== 0) return presenterSort;

  // If neither is presenter, check if either is local
  const isS1Local = VideoService.isLocalStream(s1.stream);
  const isS2Local = VideoService.isLocalStream(s2.stream);

  if (isS1Local && !isS2Local) return -1;
  if (!isS1Local && isS2Local) return 1;

  // If both are local or both are not local, check pinned status
  const pinnedSort = sortByPinned(s1, s2, moderatorFirst);
  if (pinnedSort !== 0) return pinnedSort;

  // Finally, sort alphabetically
  return UserListService.sortUsersByName(s1, s2);
};

// MOBILE sort — pin -> local(own) -> voice activity (desc) -> has camera -> alphabetical.
const isPinnedItem = (s: VideoItem) => (s.type === VIDEO_TYPES.STREAM && !!s.user?.pinned)
  || (s.type === VIDEO_TYPES.AUDIO_ONLY && !!s.user?.pinned)
  || (s.type === VIDEO_TYPES.GRID && !!s.pinned);

const isLocalItem = (s: VideoItem) => ('stream' in s) && VideoService.isLocalStream(s.stream);

const hasCameraItem = (s: VideoItem) => s.type === VIDEO_TYPES.STREAM
  || s.type === VIDEO_TYPES.CONNECTING;

const lastFloorTimeItem = (s: VideoItem) => (('lastFloorTime' in s) && s.lastFloorTime ? s.lastFloorTime : '0');

export const sortMobile = (s1: VideoItem, s2: VideoItem) => {
  const p1 = isPinnedItem(s1);
  const p2 = isPinnedItem(s2);
  if (p1 && !p2) return -1;
  if (!p1 && p2) return 1;

  const l1 = isLocalItem(s1);
  const l2 = isLocalItem(s2);
  if (l1 && !l2) return -1;
  if (!l1 && l2) return 1;

  const t1 = lastFloorTimeItem(s1);
  const t2 = lastFloorTimeItem(s2);
  if (t2 < t1) return -1;
  if (t2 > t1) return 1;

  const c1 = hasCameraItem(s1);
  const c2 = hasCameraItem(s2);
  if (c1 && !c2) return -1;
  if (!c1 && c2) return 1;

  return UserListService.sortUsersByName(s1 as StreamItem, s2 as StreamItem);
};

const SORTING_METHODS = Object.freeze({
  // Default
  LOCAL_ALPHABETICAL: {
    sortingMethod: sortLocalAlphabetical,
    localFirst: true,
  },
  VOICE_ACTIVITY_LOCAL: {
    sortingMethod: sortVoiceActivityLocal,
    localFirst: false,
  },
  LOCAL_VOICE_ACTIVITY: {
    sortingMethod: sortLocalVoiceActivity,
    localFirst: true,
  },
  LOCAL_PRESENTER_ALPHABETICAL: {
    sortingMethod: sortLocalPresenterAlphabetical,
    localFirst: true,
  },
  PRESENTER_LOCAL_PINNED: {
    sortingMethod: sortPresenterLocalPinned,
    localFirst: false,
  },
});

export const getSortingMethod = (identifier: string): SortingMethodConfig => {
  return SORTING_METHODS[identifier as keyof typeof SORTING_METHODS] || SORTING_METHODS[DEFAULT_SORTING_MODE];
};

export const sortVideoStreams = (streams: StreamItem[], mode: string, moderatorFirst = false) => {
  const { sortingMethod } = getSortingMethod(mode);
  const sorted = streams.sort((s1, s2) => sortingMethod(s1, s2, moderatorFirst));
  return sorted;
};
