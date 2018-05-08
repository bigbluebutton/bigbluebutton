import Auth from '/imports/ui/services/auth';
import { check } from 'meteor/check';
import { notify } from '/imports/ui/services/notification';

/**
 * Send the request to the server via Meteor.call and don't treat errors.
 *
 * @param {string} name
 * @param {any} args
 * @see https://docs.meteor.com/api/methods.html#Meteor-call
 * @return {Promise}
 */
export function makeCall(name, ...args) {
  check(name, String);

  const { credentials } = Auth;

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
export function call(name, ...args) {
  return makeCall(name, ...args).catch((e) => {
    notify(`Ops! Error while executing ${name}`, 'error');
    throw e;
  });
}

export function log(type = 'error', message, ...args) {
  const { credentials } = Auth;
  const userInfo = window.navigator;
  const clientInfo = {
    language: userInfo.language,
    userAgent: userInfo.userAgent,
    screenSize: { width: window.screen.width, height: window.screen.height },
    windowSize: { width: window.innerWidth, height: window.innerHeight },
    bbbVersion: Meteor.settings.public.app.bbbServerVersion,
    location: window.location.href,
  };

  const messageOrStack = message.stack || message.message || message.toString();
  console.log('tainan');
  console.debug(`CLIENT LOG (${type.toUpperCase()}): `, messageOrStack, ...args);

  Meteor.call('logClient', type, messageOrStack, {
    clientInfo,
    credentials,
    ...args,
  });
}
