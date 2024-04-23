import AbstractCollection from '/imports/ui/services/LocalCollectionSynchronizer/LocalCollectionSynchronizer';

// Collections
import PresentationUploadToken from '/imports/api/presentation-upload-token';
import Screenshare from '/imports/api/screenshare';
import UserInfos from '/imports/api/users-infos';
import UserSettings from '/imports/api/users-settings';
import VideoStreams from '/imports/api/video-streams';
import VoiceUsers from '/imports/api/voice-users';
import WhiteboardMultiUser from '/imports/api/whiteboard-multi-user';
import Pads, { PadsSessions, PadsUpdates } from '/imports/api/pads';
import Breakouts from '/imports/api/breakouts';
import Meetings, {
  MeetingTimeRemaining, Notifications,
} from '/imports/api/meetings';
import Users from '/imports/api/users';

// Custom Publishers
export const localCollectionRegistry = {
  localPresentationUploadTokenSync: new AbstractCollection(
    PresentationUploadToken,
    PresentationUploadToken,
  ),
  localScreenshareSync: new AbstractCollection(Screenshare, Screenshare),
  localUserInfosSync: new AbstractCollection(UserInfos, UserInfos),
  localUserSettingsSync: new AbstractCollection(UserSettings, UserSettings),
  localVideoStreamsSync: new AbstractCollection(VideoStreams, VideoStreams),
  localVoiceUsersSync: new AbstractCollection(VoiceUsers, VoiceUsers),
  localWhiteboardMultiUserSync: new AbstractCollection(WhiteboardMultiUser, WhiteboardMultiUser),
  localPadsSync: new AbstractCollection(Pads, Pads),
  localPadsSessionsSync: new AbstractCollection(PadsSessions, PadsSessions),
  localPadsUpdatesSync: new AbstractCollection(PadsUpdates, PadsUpdates),
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
