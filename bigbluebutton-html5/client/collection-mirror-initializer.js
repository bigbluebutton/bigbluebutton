import AbstractCollection from '/imports/ui/services/LocalCollectionSynchronizer/LocalCollectionSynchronizer';

// Collections
import Screenshare from '/imports/api/screenshare';
import Breakouts from '/imports/api/breakouts';
import Meetings, {
  MeetingTimeRemaining, Notifications,
} from '/imports/api/meetings';
import Users from '/imports/api/users';

// Custom Publishers
export const localCollectionRegistry = {
  localScreenshareSync: new AbstractCollection(Screenshare, Screenshare),
  localMeetingTimeRemainingSync: new AbstractCollection(MeetingTimeRemaining, MeetingTimeRemaining),
  localBreakoutsSync: new AbstractCollection(Breakouts, Breakouts),
  localMeetingsSync: new AbstractCollection(Meetings, Meetings),
  localUsersSync: new AbstractCollection(Users, Users),
  localNotificationsSync: new AbstractCollection(Notifications, Notifications),
};

const collectionMirrorInitializer = () => {
  Object.values(localCollectionRegistry).forEach((localCollection) => {
    localCollection.setupListeners();
  });
};

export default collectionMirrorInitializer;
