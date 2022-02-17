import UserListService from '/imports/ui/components/user-list/service';
import Auth from '/imports/ui/services/auth';

const DEFAULT_SORTING_MODE = 'LOCAL_ALPHABETICAL';

// pin first
export const sortPin = (s1, s2) => {
  if (s1.pin) {
    return -1;
  } if (s2.pin) {
    return 1;
  }
  return 0;
};

export const mandatorySorting = (s1, s2) => sortPin(s1, s2);

// lastFloorTime, descending
export const sortVoiceActivity = (s1, s2) => {
  if (s2.lastFloorTime < s1.lastFloorTime) {
    return -1;
  } else if (s2.lastFloorTime > s1.lastFloorTime) {
    return 1;
  } else return 0;
};

// pin -> lastFloorTime (descending) -> alphabetical -> local
export const sortVoiceActivityLocal = (s1, s2) => {
  if (s1.userId === Auth.userID) {
    return 1;
  } if (s2.userId === Auth.userID) {
    return -1;
  }

  return mandatorySorting(s1, s2)
    || sortVoiceActivity(s1, s2)
    || UserListService.sortUsersByName(s1, s2);
};

// pin -> local -> lastFloorTime (descending) -> alphabetical
export const sortLocalVoiceActivity = (s1, s2) => mandatorySorting(s1, s2)
    || UserListService.sortUsersByCurrent(s1, s2)
    || sortVoiceActivity(s1, s2)
    || UserListService.sortUsersByName(s1, s2);

// pin -> local -> alphabetic
export const sortLocalAlphabetical = (s1, s2) => mandatorySorting(s1, s2)
    || UserListService.sortUsersByCurrent(s1, s2)
    || UserListService.sortUsersByName(s1, s2);

export const sortPresenter = (s1, s2) => {
  if (UserListService.isUserPresenter(s1.userId)) {
    return -1;
  } else if (UserListService.isUserPresenter(s2.userId)) {
    return 1;
  } else return 0;
};

// pin -> local -> presenter -> alphabetical
export const sortLocalPresenterAlphabetical = (s1, s2) => mandatorySorting(s1, s2)
    || UserListService.sortUsersByCurrent(s1, s2)
    || sortPresenter(s1, s2)
    || UserListService.sortUsersByName(s1, s2);

// SORTING_METHODS: registrar of configurable video stream sorting modes
// Keys are the method name (String) which are to be configured in settings.yml
// ${streamSortingMethod} flag.
//
// Values are a objects which describe the sorting mode:
//   - sortingMethod (function): a sorting function defined in this module
//   - neededData (Object): data members that will be fetched from the server's
//       video-streams collection
//   - filter (Boolean): whether the sorted stream list has to be post processed
//       to remove uneeded attributes. The needed attributes are: userId, streams
//       and name. Anything other than that is superfluous.
//   - localFirst (Boolean): true pushes local streams to the beginning of the list,
//       false to the end
//       The reason why this flags exists is due to pagination: local streams are
//       stripped out of the streams list prior to sorting+partiotioning. They're
//       added (pushed) afterwards. To avoid re-sorting the page, this flag indicates
//       where it should go.
//
// To add a new sorting flavor:
//   1 - implement a sorting function, add it here (like eg sortPresenterAlphabetical)
//     1.1.: the sorting function has the same behaviour as a regular .sort callback
//   2 - add an entry to SORTING_METHODS, the key being the name to be used
//   in settings.yml and the value object like the aforementioned
const MANDATORY_DATA_TYPES = {
  userId: 1, stream: 1, name: 1, deviceId: 1, floor: 1, pin: 1,
};
const SORTING_METHODS = Object.freeze({
  // Default
  LOCAL_ALPHABETICAL: {
    sortingMethod: sortLocalAlphabetical,
    neededDataTypes: MANDATORY_DATA_TYPES,
    localFirst: true,
  },
  VOICE_ACTIVITY_LOCAL: {
    sortingMethod: sortVoiceActivityLocal,
    neededDataTypes: {
      lastFloorTime: 1, floor: 1, ...MANDATORY_DATA_TYPES,
    },
    filter: true,
    localFirst: false,
  },
  LOCAL_VOICE_ACTIVITY: {
    sortingMethod: sortLocalVoiceActivity,
    neededDataTypes: {
      lastFloorTime: 1, floor: 1, ...MANDATORY_DATA_TYPES,
    },
    filter: true,
    localFirst: true,
  },
  LOCAL_PRESENTER_ALPHABETICAL: {
    sortingMethod: sortLocalPresenterAlphabetical,
    neededDataTypes: MANDATORY_DATA_TYPES,
    localFirst: true,
  }
});

export const getSortingMethod = (identifier) => {
  return SORTING_METHODS[identifier] || SORTING_METHODS[DEFAULT_SORTING_MODE];
};

export const sortVideoStreams = (streams, mode) => {
  const { sortingMethod, filter } = getSortingMethod(mode);
  const sorted = streams.sort(sortingMethod);

  if (!filter) return sorted;

  return sorted.map(videoStream => ({
    stream: videoStream.stream,
    userId: videoStream.userId,
    name: videoStream.name,
    floor: videoStream.floor,
    pin: videoStream.pin,
  }));
};
