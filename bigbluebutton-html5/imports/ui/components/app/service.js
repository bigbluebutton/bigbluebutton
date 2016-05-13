import { Meteor } from 'meteor/meteor';
import Users from '/imports/api/users/collection';
import Chat from '/imports/api/chat/collection';
import Meetings from '/imports/api/meetings/collection';
import Cursor from '/imports/api/cursor/collection';
import Polls from '/imports/api/polls';

function setInStorage(key, value) {
  if (!!value) {
    console.log('in setInStorage', key, value);
    localStorage.setItem(key, value);
  }
};

function getInStorage(key) {
  return localStorage.getItem(key);
};

function setCredentials(nextState, replace) {
  if (!!nextState && !!nextState.params) {
    setInStorage('meetingID', nextState.params.meetingID);
    setInStorage('userID', nextState.params.userID);
    setInStorage('authToken', nextState.params.authToken);
  }
};

function subscribeForData() {
  subscribeFor('chat');
  subscribeFor('cursor');
  subscribeFor('deskshare');
  subscribeFor('meetings');
  subscribeFor('polls');
  subscribeFor('presentations');
  subscribeFor('shapes');
  subscribeFor('slides');
  subscribeFor('users');

  window.Users = Users; // for debug purposes TODO remove
  window.Chat = Chat; // for debug purposes TODO remove
  window.Meetings = Meetings; // for debug purposes TODO remove
  window.Cursor = Cursor; // for debug purposes TODO remove
  window.Polls = Polls; // for debug purposes TODO remove
};

function subscribeFor(collectionName) {
  const userID = getInStorage('userID');
  const meetingID = getInStorage('meetingID');
  const authToken = getInStorage('authToken');

  // console.log("subscribingForData", collectionName, meetingID, userID, authToken);

  Meteor.subscribe(collectionName, meetingID, userID, authToken, onError, onReady);
};

function onError(error, result) {
  // console.log("OnError", error, result);
};

function onReady() {
  // console.log("OnReady", Users.find().fetch());
};

function pollExists() {
  return !!(Polls.findOne({}));
}

export {
  pollExists,
  subscribeForData,
  setCredentials,
  getInStorage,
};
