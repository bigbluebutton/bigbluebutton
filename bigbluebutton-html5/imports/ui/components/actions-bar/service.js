import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import fp from 'lodash/fp';
import { makeCall } from '/imports/ui/services/api';
import Meetings from '/imports/api/meetings';
import Breakouts from '/imports/api/breakouts';
import { getVideoId } from '/imports/ui/components/external-video-player/service';

const USER_CONFIG = Meteor.settings.public.user;
const ROLE_MODERATOR = USER_CONFIG.role_moderator;

const getBreakouts = () => Breakouts.find({ parentMeetingId: Auth.meetingID })
  .fetch()
  .sort((a, b) => a.sequence - b.sequence);

const getBreakoutUser = user => Users.find({
  extId: new RegExp(`^${user.userId}`),
  connectionStatus: 'online',
}).fetch();

const currentBreakoutUsers = userArray => userArray.length === 1;

const filterBreakoutUsers = filter => users => users.filter(filter);

const filterUsersNotAssigned = filterBreakoutUsers(currentBreakoutUsers);

const mapUsersToNotAssined = mapFunction => users => users.map(mapFunction);

const flatUsersArray = usersArray => usersArray.reduce((acc, users) => [...acc, ...users], []);

/*
  The concept of pipe is simple
  it combines n functions. It’s a pipe flowing left-to-right,
  calling each function with the output of the last one.
*/
const getUsersNotAssigned = fp.pipe(
  mapUsersToNotAssined(getBreakoutUser),
  filterUsersNotAssigned,
  flatUsersArray,
);

const takePresenterRole = () => makeCall('assignPresenter', Auth.userID);

export default {
  isUserPresenter: () => Users.findOne({ userId: Auth.userID }).presenter,
  isUserModerator: () => Users.findOne({ userId: Auth.userID }).role === ROLE_MODERATOR,
  recordSettingsList: () => Meetings.findOne({ meetingId: Auth.meetingID }).recordProp,
  meetingIsBreakout: () => Meetings.findOne({ meetingId: Auth.meetingID }).meetingProp.isBreakout,
  meetingName: () => Meetings.findOne({ meetingId: Auth.meetingID }).meetingProp.name,
  users: () => Users.find({ connectionStatus: 'online', meetingId: Auth.meetingID }).fetch(),
  hasBreakoutRoom: () => Breakouts.find({ parentMeetingId: Auth.meetingID }).fetch().length > 0,
  toggleRecording: () => makeCall('toggleRecording'),
  createBreakoutRoom: (numberOfRooms, durationInMinutes, freeJoin = true, record = false) => makeCall('createBreakoutRoom', numberOfRooms, durationInMinutes, freeJoin, record),
  sendInvitation: (breakoutId, userId) => makeCall('requestJoinURL', { breakoutId, userId }),
  getBreakouts,
  getUsersNotAssigned,
  takePresenterRole,
  isSharingVideo: () => getVideoId(),
};
