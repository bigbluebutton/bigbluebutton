import Logger from '/imports/startup/server/logger';
import AuthTokenValidation from '/imports/api/auth-token-validation';

export default async function removeValidationState(meetingId, userId, connectionId) {
  const selector = {
    meetingId, userId, connectionId,
  };

  try {
    await AuthTokenValidation.removeAsync(selector);
  } catch (error) {
    Logger.error(`Could not remove from collection AuthTokenValidation: ${error}`);
  }
}
