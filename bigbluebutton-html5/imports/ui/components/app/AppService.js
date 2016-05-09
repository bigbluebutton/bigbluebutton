import { Meteor } from 'meteor/meteor'
import { Users } from '/imports/startup/collections';

const setInStorage = function(key, value) {
  if (!!value) {
    console.log('in setInStorage', key, value);
    localStorage.setItem(key, value);
  }
};

const getInStorage = function(key) {
  return localStorage.getItem(key);
};

export const setCredentials = function (nextState, replace) {
  setInStorage('meetingID', nextState.params.meetingID);
  setInStorage('userID', nextState.params.userID);
  setInStorage('authToken', nextState.params.authToken);
};

export const subscribeForData = function() {
  const userID = getInStorage("userID");
  const meetingID = getInStorage("meetingID");
  const authToken = getInStorage("authToken");
  console.log("subscribingForData" , userID, meetingID, authToken);

  Meteor.subscribe('bbb_users', meetingID, userID, authToken, onError(), onReady());
};

let onError = function(error, result) {
  // console.log("OnError", error, result);
};


let onReady = function() {
  console.log("OnReady", Users.find().fetch());
  window.Users = Users; // for debug purposes TODO remove
};
