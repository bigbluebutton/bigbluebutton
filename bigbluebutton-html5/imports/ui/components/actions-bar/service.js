import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import _ from 'lodash/fp';
import { makeCall } from '/imports/ui/services/api';
import Meetings from '/imports/api/meetings';
import Breakouts from '/imports/api/breakouts';

const getBreakouts = () => Breakouts.find({ parentMeetingId: Auth.meetingID })
  .fetch()
  .sort((a, b) => a.sequence - b.sequence);

const getBreakoutUser = user => Users.find({
  extId: new RegExp(user.userId),
  connectionStatus: 'online',
}).fetch();

const verifyUserThatJoinedOnBreakout = userArray => userArray.length === 1;

const filterUsersNotAssigned = filter => users => users.filter(filter);

const mapUsersToNotAssined = mapFunction => users => users.map(mapFunction);

const flatUsersArray = usersArray => usersArray.flat();

const getUsersNotAssigned = _.pipe(
  mapUsersToNotAssined(getBreakoutUser),
  filterUsersNotAssigned(verifyUserThatJoinedOnBreakout),
  flatUsersArray,
);

const takePresenterRole = () => makeCall('assignPresenter', Auth.userID);

export default {
  isUserPresenter: () => Users.findOne({ userId: Auth.userID }).presenter,
  isUserModerator: () => Users.findOne({ userId: Auth.userID }).moderator,
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
};
