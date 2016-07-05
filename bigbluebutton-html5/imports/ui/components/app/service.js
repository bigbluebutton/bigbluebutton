import { Meteor } from 'meteor/meteor';
import { callServer } from '/imports/ui/services/api';
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
    replace({
      pathname: '/'
    });
  }
};

function subscribeForData() {
  callServer('validateAuthToken', function() {
    console.log('LUL');
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

    Auth.setLogOut();
  });
};

function subscribeFor(collectionName) {
  const credentials = Auth.getCredentials();

  // console.log("subscribingForData", collectionName, meetingID, userID, authToken);

  Meteor.subscribe(collectionName, credentials, onError, onReady);
};

function onError(error, result) {

  // console.log("OnError", error, result);
  console.log('OnError', error, result);
  Auth.completeLogout();
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
