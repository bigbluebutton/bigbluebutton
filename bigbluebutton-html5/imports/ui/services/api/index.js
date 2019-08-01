import Auth from '/imports/ui/services/auth';
import { check } from 'meteor/check';
import logger from '/imports/startup/client/logger';

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
      reject(() => logger.warn({
        logCode: 'servicesapiindex_makeCall',
        extraInfo: {
          attemptForUserInfo: Auth.fullInfo,
          name,
          ...args,
        },
      }, 'Connection to Meteor was interrupted.'));
    }
  });
}
