import Auth from '/imports/ui/services/auth';
import { check } from 'meteor/check';
import Notifications from '/imports/api/notification';

/**
 * Send the request to the server via Meteor.call and don't treat errors.
 * 
 * @param {string} name 
 * @param {any} args 
 * @see https://docs.meteor.com/api/methods.html#Meteor-call
 * @return {Promise}
 */
function callServer(name, ...args) {
  check(name, String);

  const credentials = Auth.credentials;

  return new Promise((resolve, reject) => {
    Meteor.call(name, credentials, ...args, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

/**
 * Send the request to the server via Meteor.call and treat the error to a default callback.
 * 
 * @param {string} name 
 * @param {any} args 
 * @see https://docs.meteor.com/api/methods.html#Meteor-call
 * @return {Promise}
 */
function treated(name, ...args) {
  return callServer(name, ...args).catch((e) => {Notifications.insert({name:`Error while executing ${name}`}); throw e });
};

const API = {
  callServer,
  treated
};

export default API;

export {
  callServer, treated
};