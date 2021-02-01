import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import { makeCall } from '/imports/ui/services/api';
import Meetings from '/imports/api/meetings';
import Meeting from '/imports/ui/services/meeting';
import Breakouts from '/imports/api/breakouts';
import AudioManager from '/imports/ui/services/audio-manager';
import { getVideoUrl } from '/imports/ui/components/external-video-player/service';

const USER_CONFIG = Meteor.settings.public.user;
const ROLE_MODERATOR = USER_CONFIG.role_moderator;
const DIAL_IN_USER = 'dial-in-user';

const getBreakouts = () => Breakouts.find({ parentMeetingId: Auth.meetingID })
  .fetch()
  .sort((a, b) => a.sequence - b.sequence);

const hasBreakouts = () => Breakouts
  .find( { parentMeetingId: Auth.meetingID }, { fields: {} })
  .count() > 0;

const currentBreakoutUsers = user => !Breakouts.findOne({
  'joinedUsers.userId': new RegExp(`^${user.userId}`),
});

const filterBreakoutUsers = filter => users => users.filter(filter);

const getUsersNotAssigned = filterBreakoutUsers(currentBreakoutUsers);

const takePresenterRole = () => makeCall('assignPresenter', Auth.userID);

const muteMicrophone = () => {
  if (!AudioManager.isMuted) {
    makeCall('toggleVoice');
  }
}

const isTranslatorTalking = () => {
  console.log("translator talking!")
  const translationLanguageExtension = AudioManager.translationLanguageExtension;
  let isTranslatorTalking = false;
  if(translationLanguageExtension >= 0) {
    isTranslatorTalking = Meeting.isTranslatorSpeaking(translationLanguageExtension);
  }
  return isTranslatorTalking;
}

export default {
  amIPresenter: () => Users.findOne({ userId: Auth.userID },
    { fields: { presenter: 1 } }).presenter,
  amIModerator: () => Users.findOne({ userId: Auth.userID },
    { fields: { role: 1 } }).role === ROLE_MODERATOR,
  meetingName: () => Meetings.findOne({ meetingId: Auth.meetingID },
    { fields: { 'meetingProp.name': 1 } }).meetingProp.name,
  users: () => Users.find({
    connectionStatus: 'online',
    meetingId: Auth.meetingID,
    clientType: { $ne: DIAL_IN_USER },
  }).fetch(),
  isBreakoutEnabled: () => Meetings.findOne({ meetingId: Auth.meetingID },
    { fields: { 'breakoutProps.enabled': 1 } }).breakoutProps.enabled,
  isBreakoutRecordable: () => Meetings.findOne({ meetingId: Auth.meetingID },
    { fields: { 'breakoutProps.record': 1 } }).breakoutProps.record,
  toggleRecording: () => makeCall('toggleRecording'),
  createBreakoutRoom: (numberOfRooms, durationInMinutes, record = false) => makeCall('createBreakoutRoom', numberOfRooms, durationInMinutes, record),
  sendInvitation: (breakoutId, userId) => makeCall('requestJoinURL', { breakoutId, userId }),
  getBreakouts,
  hasBreakouts,
  getUsersNotAssigned,
  takePresenterRole,
  isSharingVideo: () => getVideoUrl(),
  muteMicrophone,
  isTranslatorTalking,
  isTranslatorMuted: () => AudioManager.isTranslatorMuted(),
};
