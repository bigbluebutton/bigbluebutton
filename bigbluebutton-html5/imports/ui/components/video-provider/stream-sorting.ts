import { StreamItem } from './types';
import UserListService from '/imports/ui/components/user-list/service';
import Auth from '/imports/ui/services/auth';
import VideoService from './service';

const DEFAULT_SORTING_MODE = 'LOCAL_ALPHABETICAL';

// connecting last -> pin first
export const sortPin = (s1: StreamItem, s2: StreamItem) => {
  if (s1.type === 'connecting') {
    return 1;
  }
  if (s2.type === 'connecting') {
    return -1;
  }
  if (s1.user.pinned) {
    return -1;
  } if (s2.user.pinned) {
    return 1;
  }
  return 0;
};

export const mandatorySorting = (s1: StreamItem, s2: StreamItem) => sortPin(s1, s2);

// connecting last -> lastFloorTime (descending)
export const sortVoiceActivity = (s1: StreamItem, s2: StreamItem) => {
  if (s1.type === 'connecting') {
    return 1;
  }
  if (s2.type === 'connecting') {
    return -1;
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
export const sortVoiceActivityLocal = (s1: StreamItem, s2: StreamItem) => {
  if (s1.userId === Auth.userID) {
    return 1;
  } if (s2.userId === Auth.userID) {
    return -1;
  }

  return mandatorySorting(s1, s2)
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
export const sortLocalVoiceActivity = (s1: StreamItem, s2: StreamItem) => mandatorySorting(s1, s2)
    || sortByLocal(s1, s2)
    || sortVoiceActivity(s1, s2)
    || UserListService.sortUsersByName(s1, s2);

// pin -> local -> alphabetic
export const sortLocalAlphabetical = (s1: StreamItem, s2: StreamItem) => mandatorySorting(s1, s2)
    || sortByLocal(s1, s2)
    || UserListService.sortUsersByName(s1, s2);

export const sortPresenter = (s1: StreamItem, s2: StreamItem) => {
  if (s1.type === 'stream' && s1.user.presenter) {
    return -1;
  }
  if (s2.type === 'stream' && s2.user.presenter) {
    return 1;
  }
  return 0;
};

// pin -> local -> presenter -> alphabetical
export const sortLocalPresenterAlphabetical = (s1: StreamItem, s2: StreamItem) => mandatorySorting(s1, s2)
    || sortByLocal(s1, s2)
    || sortPresenter(s1, s2)
    || UserListService.sortUsersByName(s1, s2);

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
});

export const getSortingMethod = (identifier: string) => {
  return SORTING_METHODS[identifier as keyof typeof SORTING_METHODS] || SORTING_METHODS[DEFAULT_SORTING_MODE];
};

export const sortVideoStreams = (streams: StreamItem[], mode: string) => {
  const { sortingMethod } = getSortingMethod(mode);
  const sorted = streams.sort(sortingMethod);
  return sorted;
};
