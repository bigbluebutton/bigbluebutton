import { Meteor } from 'meteor/meteor';

import Auth from '/imports/ui/services/auth';

import Users from '/imports/api/users';
import Chat from '/imports/api/chat';
import Meetings from '/imports/api/meetings';
import Cursor from '/imports/api/cursor';
import Polls from '/imports/api/polls';

function setCredentials(nextState, replace) {
  if (nextState && nextState.params.authToken) {
    const { meetingID, userID, authToken } = nextState.params;
    Auth.setCredentials(meetingID, userID, authToken);
  }
};

function subscribeForData() {
  subscribeFor('users');

  Meteor.setTimeout(() => {
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
  }, 2000); //To avoid race condition where we subscribe before receiving auth from BBB
};

function subscribeFor(collectionName) {
  const credentials = Auth.getCredentials();

  // console.log("subscribingForData", collectionName, meetingID, userID, authToken);

  Meteor.subscribe(collectionName, credentials, onError, onReady);
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
};
