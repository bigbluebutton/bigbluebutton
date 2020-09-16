import Logger from '/imports/startup/server/logger';
import AuthTokenValidation from '/imports/api/auth-token-validation';

export default function upsertValidationState(meetingId, userId, validationStatus, connectionId) {
  const selector = {
    meetingId, userId, connectionId,
  };
  const modifier = {
    $set: {
      meetingId,
      userId,
      connectionId,
      validationStatus,
      updatedAt: new Date().getTime(),
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      Logger.error(`Could not upsert to collection AuthTokenValidation: ${err}`);
      return;
    }
    if (numChanged) {
      Logger.info(`Upserted ${JSON.stringify(selector)} ${validationStatus} in AuthTokenValidation`);
    }
  };

  return AuthTokenValidation.upsert(selector, modifier, cb);
}
