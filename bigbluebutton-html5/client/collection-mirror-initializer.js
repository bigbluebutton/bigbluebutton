import AbstractCollection from '/imports/ui/services/LocalCollectionSynchronizer/LocalCollectionSynchronizer';

// Collections
import PresentationUploadToken from '/imports/api/presentation-upload-token';
import Screenshare from '/imports/api/screenshare';
import UserInfos from '/imports/api/users-infos';
import Polls, { CurrentPoll } from '/imports/api/polls';
import UsersPersistentData from '/imports/api/users-persistent-data';
import UserSettings from '/imports/api/users-settings';
import VideoStreams from '/imports/api/video-streams';
import VoiceUsers from '/imports/api/voice-users';
import WhiteboardMultiUser from '/imports/api/whiteboard-multi-user';
import Captions from '/imports/api/captions';
import Pads, { PadsSessions, PadsUpdates } from '/imports/api/pads';
import AuthTokenValidation from '/imports/api/auth-token-validation';
import Breakouts from '/imports/api/breakouts';
import BreakoutsHistory from '/imports/api/breakouts-history';
import Meetings, {
  RecordMeetings, MeetingTimeRemaining, Notifications,
} from '/imports/api/meetings';
import Users from '/imports/api/users';

// Custom Publishers
export const localCollectionRegistry = {
  localCurrentPollSync: new AbstractCollection(CurrentPoll, CurrentPoll),
  localPollsSync: new AbstractCollection(Polls, Polls),
  localPresentationUploadTokenSync: new AbstractCollection(
    PresentationUploadToken,
    PresentationUploadToken,
  ),
  localScreenshareSync: new AbstractCollection(Screenshare, Screenshare),
  localUserInfosSync: new AbstractCollection(UserInfos, UserInfos),
  localUsersPersistentDataSync: new AbstractCollection(UsersPersistentData, UsersPersistentData),
  localUserSettingsSync: new AbstractCollection(UserSettings, UserSettings),
  localVideoStreamsSync: new AbstractCollection(VideoStreams, VideoStreams),
  localVoiceUsersSync: new AbstractCollection(VoiceUsers, VoiceUsers),
  localWhiteboardMultiUserSync: new AbstractCollection(WhiteboardMultiUser, WhiteboardMultiUser),
  localCaptionsSync: new AbstractCollection(Captions, Captions),
  localPadsSync: new AbstractCollection(Pads, Pads),
  localPadsSessionsSync: new AbstractCollection(PadsSessions, PadsSessions),
  localPadsUpdatesSync: new AbstractCollection(PadsUpdates, PadsUpdates),
  localAuthTokenValidationSync: new AbstractCollection(AuthTokenValidation, AuthTokenValidation),
  localRecordMeetingsSync: new AbstractCollection(RecordMeetings, RecordMeetings),
  localMeetingTimeRemainingSync: new AbstractCollection(MeetingTimeRemaining, MeetingTimeRemaining),
  localBreakoutsSync: new AbstractCollection(Breakouts, Breakouts),
  localBreakoutsHistorySync: new AbstractCollection(BreakoutsHistory, BreakoutsHistory),
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
