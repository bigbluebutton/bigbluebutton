import { Meteor } from 'meteor/meteor'
import { Users } from '/imports/api/users/usersCollection';
import { Polls } from '/imports/api/polls/polls'; //TODO Anton join these, rename one?

let AppService = function () {

  const setInStorage = function(key, value) {
    if (!!value) {
      console.log('in setInStorage', key, value);
      localStorage.setItem(key, value);
    }
  };

  const getInStorage = function(key) {
    return localStorage.getItem(key);
  };

  const setCredentials = function (nextState, replace) {
    setInStorage('meetingID', nextState.params.meetingID);
    setInStorage('userID', nextState.params.userID);
    setInStorage('authToken', nextState.params.authToken);
  };

  const subscribeForData = function() {
    subscribeFor('users');
    subscribeFor('chat');
    subscribeFor('slides');
    subscribeFor('cursor');
    subscribeFor('meetings');
    subscribeFor('shapes');
    subscribeFor('presentations');
    subscribeFor('polls');
  };

  const subscribeFor = function (collectionName) {
    const userID = getInStorage("userID");
    const meetingID = getInStorage("meetingID");
    const authToken = getInStorage("authToken");
    console.log("subscribingForData", collectionName);

    Meteor.subscribe(collectionName, meetingID, userID, authToken, onError(), onReady());
  };

  let onError = function(error, result) {
    // console.log("OnError", error, result);
  };


  let onReady = function() {
    // console.log("OnReady", Users.find().fetch());
    window.Users = Users; // for debug purposes TODO remove
  };
  
  
  const poll = Polls.findOne({});
  return {
    pollExists: !!poll,
    subscribeForData: subscribeForData,
    setCredentials: setCredentials,
  };
};

export default AppService;
