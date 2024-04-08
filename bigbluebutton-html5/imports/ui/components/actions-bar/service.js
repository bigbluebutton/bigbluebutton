import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import { makeCall } from '/imports/ui/services/api';
import Meetings from '/imports/api/meetings';
import Breakouts from '/imports/api/breakouts';
import NotesService from '/imports/ui/components/notes/service';
import BreakoutsHistory from '/imports/api/breakouts-history';

const DIAL_IN_USER = 'dial-in-user';

const getBreakouts = () => Breakouts.find({ parentMeetingId: Auth.meetingID })
  .fetch()
  .sort((a, b) => a.sequence - b.sequence);

const getLastBreakouts = () => {
  const lastBreakouts = BreakoutsHistory.findOne({ meetingId: Auth.meetingID });
  if (lastBreakouts) {
    return lastBreakouts.rooms
      .sort((a, b) => a.sequence - b.sequence);
  }

  return [];
};

const currentBreakoutUsers = (user) => !Breakouts.findOne({
  'joinedUsers.userId': new RegExp(`^${user.userId}`),
});

const filterBreakoutUsers = (filter) => (users) => users.filter(filter);

const getUsersNotJoined = filterBreakoutUsers(currentBreakoutUsers);

const isMe = (intId) => intId === Auth.userID;

export default {
  isMe,
  meetingName: () => Meetings.findOne({ meetingId: Auth.meetingID},
    { fields: { name: 1 } }).name,
  users: () => Users.find({
    meetingId: Auth.meetingID,
    clientType: { $ne: DIAL_IN_USER },
  }).fetch(),
  groups: () => Meetings.findOne({ meetingId: Auth.meetingID },
    { fields: { groups: 1 } }).groups,
  isBreakoutRecordable: () => Meetings.findOne({ meetingId: Auth.meetingID },
    { fields: { 'breakoutProps.record': 1 } }).breakoutProps.record,
  createBreakoutRoom: (rooms, durationInMinutes, record = false, captureNotes = false, captureSlides = false, sendInviteToModerators = false) => makeCall('createBreakoutRoom', rooms, durationInMinutes, record, captureNotes, captureSlides, sendInviteToModerators),
  sendInvitation: (breakoutId, userId) => makeCall('requestJoinURL', { breakoutId, userId }),
  breakoutJoinedUsers: () => Breakouts.find({
    joinedUsers: { $exists: true },
  }, { fields: { joinedUsers: 1, breakoutId: 1, sequence: 1 }, sort: { sequence: 1 } }).fetch(),
  getBreakouts,
  getLastBreakouts,
  getUsersNotJoined,
  isSharedNotesPinned: () => NotesService.isSharedNotesPinned(),
};
