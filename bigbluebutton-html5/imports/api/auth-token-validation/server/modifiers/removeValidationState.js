import Logger from '/imports/startup/server/logger';
import AuthTokenValidation from '/imports/api/auth-token-validation';

export default function removeValidationState(meetingId, userId, connectionId) {
  const selector = {
    meetingId, userId, connectionId,
  };

  const cb = (err) => {
    if (err) {
      Logger.error(`Could not remove from collection AuthTokenValidation: ${err}`);
    }
  };

  return AuthTokenValidation.remove(selector, cb);
}
