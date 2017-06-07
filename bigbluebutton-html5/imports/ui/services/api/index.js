import Auth from '/imports/ui/services/auth';
import { check } from 'meteor/check';
import NotificationService from '/imports/ui/services/notification/notificationService';

/**
 * Send the request to the server via Meteor.call and don't treat errors.
 *
 * @param {string} name
 * @param {any} args
 * @see https://docs.meteor.com/api/methods.html#Meteor-call
 * @return {Promise}
 */
function makeCall(name, ...args) {
  check(name, String);

  const credentials = Auth.credentials;

  return new Promise((resolve, reject) => {
    Meteor.call(name, credentials, ...args, (error, result) => {
      if (error) {
        reject(error);
      }

      resolve(result);
    });
  });
}

/**
 * Send the request to the server via Meteor.call and treat the error to a default callback.
 *
 * @param {string} name
 * @param {any} args
 * @see https://docs.meteor.com/api/methods.html#Meteor-call
 * @return {Promise}
 */
function call(name, ...args) {
  return makeCall(name, ...args).catch((e) => {
    NotificationService.add({ notification: `Error while executing ${name}` });
    throw e;
  });
}

/**
 * Log the error to the client and to the server.
 *
 * @example
 * @code{ logClient({error:"Error caused by blabla"}) }
 */
function logClient() {
  const credentials = Auth.credentials;
  const args = Array.prototype.slice.call(arguments, 0);
  const userInfo = window.navigator;

  args.push({
    systemProps: {
      language: userInfo.language,
      userAgent: userInfo.userAgent,
      screenSize: { width: screen.width, height: screen.height },
      windowSize: { width: window.innerWidth, height: window.innerHeight },
      bbbVersion: Meteor.settings.public.app.bbbServerVersion,
      location: window.location.href,
    },
  });

  const logTypeInformed = arguments.length > 1;
  const outputLog = logTypeInformed ? Array.prototype.slice.call(args, 1) : args;
  console.warn('Client log:', outputLog);

  Meteor.call('logClient',
    logTypeInformed ? args[0] : 'info',
    credentials,
    outputLog,
  );
}

const API = {
  logClient,
  makeCall,
  call,
};

export default API;

export {
  makeCall,
  call,
  logClient,
};
