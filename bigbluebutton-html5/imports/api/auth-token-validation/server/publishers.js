import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import _ from 'lodash';
import AuthTokenValidation from '/imports/api/auth-token-validation';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';

async function authTokenValidation({ meetingId, userId }) {
  check(meetingId, String);
  check(userId, String);

  const credentials = await new Promise((resp)=> {
    const tempSettimeout = () => {
      setTimeout(() => {
        const cred = extractCredentials(this.userId);
        const objIsEmpty = _.isEmpty(cred);
        if (objIsEmpty) {
          return tempSettimeout();
        }
        return resp(cred);
      }, 200);
    };
    tempSettimeout();
  });

  const { meetingId: mId, requesterUserId } = credentials;

  const selector = {
    meetingId: mId,
    userId: requesterUserId,
  };

  Logger.debug(`Publishing auth-token-validation for ${meetingId} ${userId}`);

  return AuthTokenValidation.find(selector);
}

function publish(...args) {
  const boundAuthTokenValidation = authTokenValidation.bind(this);
  return boundAuthTokenValidation(...args);
}

Meteor.publish('auth-token-validation', publish);
