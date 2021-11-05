import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import { makeCall } from '/imports/ui/services/api';
import Meetings from '/imports/api/meetings';
import Breakouts from '/imports/api/breakouts';
import { getVideoUrl } from '/imports/ui/components/external-video-player/service';

const USER_CONFIG = Meteor.settings.public.user;
const ROLE_MODERATOR = USER_CONFIG.role_moderator;
const DIAL_IN_USER = 'dial-in-user';

const getBreakouts = () => Breakouts.find({ parentMeetingId: Auth.meetingID })
  .fetch()
  .sort((a, b) => a.sequence - b.sequence);

const currentBreakoutUsers = user => !Breakouts.findOne({
  'joinedUsers.userId': new RegExp(`^${user.userId}`),
});

const filterBreakoutUsers = filter => users => users.filter(filter);

const getUsersNotAssigned = filterBreakoutUsers(currentBreakoutUsers);

const takePresenterRole = () => makeCall('assignPresenter', Auth.userID);

const amIPresenter = () => {
  const currentUser = Users.findOne({ userId: Auth.userID },
    { fields: { presenter: 1 } });

  if (!currentUser) {
    return false;
  }

  return currentUser.presenter;
};

const amIModerator = () => {
  const currentUser = Users.findOne({ userId: Auth.userID },
    { fields: { role: 1 } });

  if (!currentUser) {
    return false;
  }

  return currentUser.role === ROLE_MODERATOR;
};

const isMe = intId => intId === Auth.userID;


export default {
  amIPresenter,
  amIModerator,
  isMe,
  currentUser: () => Users.findOne({ meetingId: Auth.meetingID, userId: Auth.userID },
    { fields: { userId: 1, emoji: 1 } }),
  meetingName: () => Meetings.findOne({ meetingId: Auth.meetingID },
    { fields: { 'meetingProp.name': 1 } }).meetingProp.name,
  users: () => Users.find({
    meetingId: Auth.meetingID,
    clientType: { $ne: DIAL_IN_USER },
  }).fetch(),
  isBreakoutEnabled: () => Meetings.findOne({ meetingId: Auth.meetingID },
    { fields: { 'breakoutProps.enabled': 1 } }).breakoutProps.enabled,
  isBreakoutRecordable: () => Meetings.findOne({ meetingId: Auth.meetingID },
    { fields: { 'breakoutProps.record': 1 } }).breakoutProps.record,
  toggleRecording: () => makeCall('toggleRecording'),
  createBreakoutRoom: (rooms, durationInMinutes, record = false) => makeCall('createBreakoutRoom', rooms, durationInMinutes, record),
  sendInvitation: (breakoutId, userId) => makeCall('requestJoinURL', { breakoutId, userId }),
  breakoutJoinedUsers: () => Breakouts.find({
    joinedUsers: { $exists: true },
  }, { fields: { joinedUsers: 1, breakoutId: 1, sequence: 1 }, sort: { sequence: 1 } }).fetch(),
  getBreakouts,
  getUsersNotAssigned,
  takePresenterRole,
  isSharingVideo: () => getVideoUrl(),
};
