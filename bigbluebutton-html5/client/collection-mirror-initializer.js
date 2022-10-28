import AbstractCollection from '/imports/ui/services/LocalCollectionSynchronizer/LocalCollectionSynchronizer';

// Collections
import Presentations from '/imports/api/presentations';
import PresentationPods from '/imports/api/presentation-pods';
import PresentationUploadToken from '/imports/api/presentation-upload-token';
import Screenshare from '/imports/api/screenshare';
import UserInfos from '/imports/api/users-infos';
import Polls, { CurrentPoll } from '/imports/api/polls';
import UsersPersistentData from '/imports/api/users-persistent-data';
import UserSettings from '/imports/api/users-settings';
import VideoStreams from '/imports/api/video-streams';
import VoiceUsers from '/imports/api/voice-users';
import WhiteboardMultiUser from '/imports/api/whiteboard-multi-user';
import GroupChat from '/imports/api/group-chat';
import ConnectionStatus from '/imports/api/connection-status';
import Captions from '/imports/api/captions';
import Pads, { PadsSessions, PadsUpdates } from '/imports/api/pads';
import AuthTokenValidation from '/imports/api/auth-token-validation';
import Annotations from '/imports/api/annotations';
import Breakouts from '/imports/api/breakouts';
import BreakoutsHistory from '/imports/api/breakouts-history';
import guestUsers from '/imports/api/guest-users';
import Meetings, { RecordMeetings, ExternalVideoMeetings, MeetingTimeRemaining } from '/imports/api/meetings';
import { UsersTyping } from '/imports/api/group-chat-msg';
import Users, { CurrentUser } from '/imports/api/users';
import { Slides, SlidePositions } from '/imports/api/slides';

// Custom Publishers
export const localCollectionRegistry = {
  localCurrentPollSync: new AbstractCollection(CurrentPoll, CurrentPoll),
  localCurrentUserSync: new AbstractCollection(CurrentUser, CurrentUser),
  localSlidesSync: new AbstractCollection(Slides, Slides),
  localSlidePositionsSync: new AbstractCollection(SlidePositions, SlidePositions),
  localPollsSync: new AbstractCollection(Polls, Polls),
  localPresentationsSync: new AbstractCollection(Presentations, Presentations),
  localPresentationPodsSync: new AbstractCollection(PresentationPods, PresentationPods),
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
  localGroupChatSync: new AbstractCollection(GroupChat, GroupChat),
  localConnectionStatusSync: new AbstractCollection(ConnectionStatus, ConnectionStatus),
  localCaptionsSync: new AbstractCollection(Captions, Captions),
  localPadsSync: new AbstractCollection(Pads, Pads),
  localPadsSessionsSync: new AbstractCollection(PadsSessions, PadsSessions),
  localPadsUpdatesSync: new AbstractCollection(PadsUpdates, PadsUpdates),
  localAuthTokenValidationSync: new AbstractCollection(AuthTokenValidation, AuthTokenValidation),
  localAnnotationsSync: new AbstractCollection(Annotations, Annotations),
  localRecordMeetingsSync: new AbstractCollection(RecordMeetings, RecordMeetings),
  localExternalVideoMeetingsSync: new AbstractCollection(
    ExternalVideoMeetings,
    ExternalVideoMeetings,
  ),
  localMeetingTimeRemainingSync: new AbstractCollection(MeetingTimeRemaining, MeetingTimeRemaining),
  localUsersTypingSync: new AbstractCollection(UsersTyping, UsersTyping),
  localBreakoutsSync: new AbstractCollection(Breakouts, Breakouts),
  localBreakoutsHistorySync: new AbstractCollection(BreakoutsHistory, BreakoutsHistory),
  localGuestUsersSync: new AbstractCollection(guestUsers, guestUsers),
  localMeetingsSync: new AbstractCollection(Meetings, Meetings),
  localUsersSync: new AbstractCollection(Users, Users),
};

const collectionMirrorInitializer = () => {
  Object.values(localCollectionRegistry).forEach((localCollection) => {
    localCollection.setupListeners();
  });
};

export default collectionMirrorInitializer;
// const localUsersSync = new AbstractCollection(CurrentUser, CurrentUser);
