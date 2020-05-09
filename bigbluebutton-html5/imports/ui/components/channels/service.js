import Breakouts from '/imports/api/breakouts';
import Meetings from '/imports/api/meetings';
import { makeCall } from '/imports/ui/services/api';
import Auth from '/imports/ui/services/auth';
import { Session } from 'meteor/session';
import Users from '/imports/api/users';
import fp from 'lodash/fp';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const findBreakouts = () => {
  // console.log(`Auth.meetingid: ${Auth.meetingID}`);
  const BreakoutRooms = Breakouts.find({
    parentMeetingId: Auth.meetingID,
  }, {
    sort: {
      sequence: 1,
    },
  }).fetch();


  return BreakoutRooms;
};


const getBreakoutByCurrentMeetingId = () => {
  console.log(`getBreakoutByCurrentMeetingId Auth.meetingid: ${Auth.meetingID}`);
  const BreakoutRooms = Breakouts.find({
    breakoutId: Auth.meetingID,
  }, {
    sort: {
      sequence: 1,
    },
  }).fetch();


  return BreakoutRooms;
};

const validateMeetingIsBreakout = (meetingId) => {
  const breakoutRoom = Breakouts.findOne({
    breakoutId: meetingId
  });
  return (breakoutRoom != null && breakoutRoom != undefined && breakoutRoom.breakoutId == meetingId);

}


const breakoutRoomUser = (breakoutId) => {
  const breakoutRooms = findBreakouts();
  const breakoutRoom = breakoutRooms.filter(breakout => breakout.breakoutId === breakoutId).shift();
  if((breakoutRoom != null && breakoutRoom != undefined))
    return breakoutRoom.users.filter(user => user.userId === Auth.userID).shift();
};

const isbreakoutRoomUser = (breakoutId, userId) => {
  const breakoutRooms = findBreakouts();
  const breakoutRoom = breakoutRooms.filter(breakout => breakout.breakoutId === breakoutId).shift();
  if((breakoutRoom != null && breakoutRoom != undefined)){
    const breakoutUser = breakoutRoom.users.filter(user => user.userId === userId).shift();
    return (breakoutUser != null && breakoutUser != undefined);
  }else{
    return false;
  }
  
};

const getAllBreakoutRoomUsers = (breakoutId) => {
  const breakoutRooms = findBreakouts();
  const breakoutRoom = breakoutRooms.filter(breakout => breakout.breakoutId === breakoutId).shift();
  if((breakoutRoom != null && breakoutRoom != undefined)){
    return breakoutRoom.users;
  }else{
    return [];
  }
  
};

// Method that returns a break out room name and user name.
//if current user is already in a break out room,it will return just user name
//if current user is in the master channel, then his name will returned. And break out
//room name will be returned if they belong to one 
const getUserNameAndGroupForDisplayRoomName = () => {

  // const {requesterUserId} = credentials;
  let user = Users.findOne({
    userId: Auth.credentials.requesterUserId,
    connectionStatus: 'online',
    });

    if(user){
      if(user.breakoutProps.isBreakoutUser){
        return {name: user.name};
      }else{
      //Now find if they are in a break out room
      const breakoutRooms = findBreakouts();
      const breakoutRoomOfUser = breakoutRooms.filter(breakout =>
        breakout.users.find(bu => bu.userId === user.userId)).shift();
        if(breakoutRoomOfUser){
          return {name: user.name, breakoutName: breakoutRoomOfUser.name};
        }else{
          return {name: user.name};
        }
      }
    }
    return null;
}


// Central function that determines if the user has a browser tab opened for the break out room he is part of
// Logic:
// 1) Current meeting has no parent meeting (so not a a break out room but master)
// 2) Look for breakout room(s) in his(including moderator) mini mongo.For moderator it will be more than one.
// so for moderator which ever break out room link is clicked in an attempt to join, that specific room will be in focus.
// 3)  In that break out room, the user needs to show up in joined_users field. This can be done in 2 ways.
// 3.1) If the name and email match
// 3.2) User id matches the pattern in joined users
const isUserActiveInBreakoutroom = userId => Breakouts.findOne({ 'joinedUsers.userId': new RegExp(`^${userId}`) });

const getBreakoutMeetingUserId = (email, name, breakoutId) => 
  Users.findOne({
    connectionStatus: 'online',
    meetingId: breakoutId,
    email: email,
    name: name}, { fields: { userId: 1 } });

const closeBreakoutPanel = () => Session.set('openPanel', 'userlist');

const endAllBreakouts = () => {
  makeCall('endAllBreakouts');
  closeBreakoutPanel();
};

const requestJoinURL = (breakoutId) => {
  makeCall('requestJoinURL', {
    breakoutId,
  });
};

const transferUserToMeeting = (fromMeetingId, toMeetingId) => makeCall('transferUser', fromMeetingId, toMeetingId);

const transferToBreakout = (breakoutId) => {
  const breakoutRooms = findBreakouts();
  const breakoutRoom = breakoutRooms.filter(breakout => breakout.breakoutId === breakoutId).shift();
  const breakoutMeeting = Meetings.findOne({
    $and: [
      { 'breakoutProps.sequence': breakoutRoom.sequence },
      { 'breakoutProps.parentId': breakoutRoom.parentMeetingId },
      { 'meetingProp.isBreakout': true },
    ],
  }, { fields: { meetingId: 1 } });
  transferUserToMeeting(Auth.meetingID, breakoutMeeting.meetingId);
};

const amIModerator = () => {
  const User = Users.findOne({ intId: Auth.userID }, { fields: { role: 1 } });
  return User.role === ROLE_MODERATOR;
};

const getBreakoutByUserId = userId => Breakouts.find(
  { 'users.userId': userId },
  { fields: { timeRemaining: 0 } },
).fetch();

const getBreakoutByUser = user => Breakouts.findOne({ users: user });

const getUsersFromBreakouts = breakoutsArray => breakoutsArray
  .map(breakout => breakout.users)
  .reduce((acc, usersArray) => [...acc, ...usersArray], []);

const filterUserURLs = userId => breakoutUsersArray => breakoutUsersArray
  .filter(user => user.userId === userId);

const getLastURLInserted = breakoutURLArray => breakoutURLArray
  .sort((a, b) => a.insertedTime - b.insertedTime).pop();

const getBreakoutUserByUserId = userId => fp.pipe(
  getBreakoutByUserId,
  getUsersFromBreakouts,
  filterUserURLs(userId),
  getLastURLInserted,
)(userId);

const getBreakouts = () => Breakouts.find({}, { sort: { sequence: 1 } }).fetch();
const getBreakoutsNoTime = () => Breakouts.find(
  {},
  {
    sort: { sequence: 1 },
    fields: { timeRemaining: 0 },
  },
).fetch();

const getBreakoutUserIsIn = userId => Breakouts.findOne({ 'joinedUsers.userId': new RegExp(`^${userId}`) }, { fields: { sequence: 1 } });

const isUserInBreakoutRoom = (joinedUsers) => {
  const userId = Auth.userID;

  return !!joinedUsers.find(user => user.userId.startsWith(userId));
};

//Only to be called in the master channel
const getUnassignedUsersInMasterChannel = (allUsers) => {
  //Get all breakout users in the system (offline and online - no harm for now)
  let breakoutUsers =  getUsersFromBreakouts(getBreakouts());
  return  allUsers.filter(u => {
      return (breakoutUsers.find(bu => bu.userId == u.userId) == undefined);
  });
}

export default {
  findBreakouts,
  getBreakoutByCurrentMeetingId,
  validateMeetingIsBreakout,
  endAllBreakouts,
  requestJoinURL,
  breakoutRoomUser,
  isbreakoutRoomUser,
  getAllBreakoutRoomUsers,
  transferUserToMeeting,
  transferToBreakout,
  meetingId: () => Auth.meetingID,
  closeBreakoutPanel,
  amIModerator,
  getBreakoutUserByUserId,
  getBreakoutByUser,
  getBreakouts,
  getBreakoutsNoTime,
  getBreakoutByUserId,
  getBreakoutUserIsIn,
  isUserInBreakoutRoom,
  isUserActiveInBreakoutroom,
  getBreakoutMeetingUserId,
  getUnassignedUsersInMasterChannel,
  getUserNameAndGroupForDisplayRoomName
};
