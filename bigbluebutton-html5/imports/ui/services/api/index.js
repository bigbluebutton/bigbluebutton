import Auth from '/imports/ui/services/auth';
import { check } from 'meteor/check';
import { notify } from '/imports/ui/services/notification';
import logger from '/imports/startup/client/logger';

export function log(type = 'error', message, ...args) {
  const logContents = { ...args };
  const topic = logContents[0] ? logContents[0].topic : null;

  const messageOrStack = message.stack || message.message || JSON.stringify(message);
  console.debug(`CLIENT LOG (${topic ? `${type.toUpperCase()}.${topic}` : type.toUpperCase()}): `, messageOrStack, ...args);

  logger[type]({
    logCode: 'services_api_log',
    extraInfo: {
      message,
      logContents,
      attemptForUserInfo: Auth.fullInfo,
    },
  }, 'Client log from ui/services/api/index.js');
}

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
    if (Meteor.status().connected) {
      Meteor.call(name, credentials, ...args, (error, result) => {
        if (error) {
          reject(error);
        }

        resolve(result);
      });
    } else {
      const error = new Error('Meteor was not connected');
      log('error', error);
      reject(error);
    }
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
