import { Meteor } from 'meteor/meteor';
import Users from '/imports/api/users/collection';
import Polls from '/imports/api/polls/collection';
import Chat from '/imports/api/chat/collection';
import Meetings from '/imports/api/meetings/collection';
import Cursor from '/imports/api/cursor/collection';

let AppService = function () {

  const setInStorage = function (key, value) {
    if (!!value) {
      console.log('in setInStorage', key, value);
      localStorage.setItem(key, value);
    }
  };

  const getInStorage = function (key) {
    return localStorage.getItem(key);
  };

  const setCredentials = function (nextState, replace) {
    if (!!nextState && !!nextState.params) {
      setInStorage('meetingID', nextState.params.meetingID);
      setInStorage('userID', nextState.params.userID);
      setInStorage('authToken', nextState.params.authToken);
    }
  };

  const subscribeForData = function () {
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

  const subscribeFor = function (collectionName) {
    const userID = getInStorage('userID');
    const meetingID = getInStorage('meetingID');
    const authToken = getInStorage('authToken');

    // console.log("subscribingForData", collectionName, meetingID, userID, authToken);

    Meteor.subscribe(collectionName, meetingID, userID, authToken, onError(), onReady());
  };

  let onError = function (error, result) {
    // console.log("OnError", error, result);
  };

  let onReady = function () {
    // console.log("OnReady", Users.find().fetch());
  };

  const poll = Polls.findOne({});
  return {
    pollExists: !!poll,
    subscribeForData: subscribeForData,
    setCredentials: setCredentials,
  };
};

export default AppService;
