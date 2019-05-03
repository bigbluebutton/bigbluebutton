import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import { makeCall } from '/imports/ui/services/api';
import Meetings from '/imports/api/meetings';
import Breakouts from '/imports/api/breakouts';
import { getVideoId } from '/imports/ui/components/external-video-player/service';

const USER_CONFIG = Meteor.settings.public.user;
const ROLE_MODERATOR = USER_CONFIG.role_moderator;

const getBreakouts = () => Breakouts.find({ parentMeetingId: Auth.meetingID })
  .fetch()
  .sort((a, b) => a.sequence - b.sequence);

const currentBreakoutUsers = user => !Breakouts.findOne({
  'joinedUsers.userId': new RegExp(`^${user.userId}`),
});

const filterBreakoutUsers = filter => users => users.filter(filter);

const getUsersNotAssigned = filterBreakoutUsers(currentBreakoutUsers);

const takePresenterRole = () => makeCall('assignPresenter', Auth.userID);

export default {
  isUserPresenter: () => Users.findOne({ userId: Auth.userID }).presenter,
  isUserModerator: () => Users.findOne({ userId: Auth.userID }).role === ROLE_MODERATOR,
  recordSettingsList: () => Meetings.findOne({ meetingId: Auth.meetingID }).recordProp,
  meetingIsBreakout: () => Meetings.findOne({ meetingId: Auth.meetingID }).meetingProp.isBreakout,
  meetingName: () => Meetings.findOne({ meetingId: Auth.meetingID }).meetingProp.name,
  users: () => Users.find({ connectionStatus: 'online', meetingId: Auth.meetingID }).fetch(),
  hasBreakoutRoom: () => Breakouts.find({ parentMeetingId: Auth.meetingID }).fetch().length > 0,
  isBreakoutEnabled: () => Meetings.findOne({ meetingId: Auth.meetingID }).breakoutProps.enabled,
  isBreakoutRecordable: () => Meetings.findOne({ meetingId: Auth.meetingID }).breakoutProps.record,
  toggleRecording: () => makeCall('toggleRecording'),
  createBreakoutRoom: (numberOfRooms, durationInMinutes, record = false) => makeCall('createBreakoutRoom', numberOfRooms, durationInMinutes, record),
  sendInvitation: (breakoutId, userId) => makeCall('requestJoinURL', { breakoutId, userId }),
  getBreakouts,
  getUsersNotAssigned,
  takePresenterRole,
  isSharingVideo: () => getVideoId(),
};
