import Logger from '/imports/startup/server/logger';
import AuthTokenValidation from '/imports/api/auth-token-validation';

export default async function upsertValidationState(
  meetingId,
  userId,
  validationStatus,
  connectionId,
  reason = null,
) {
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
      reason,
    },
  };

  try {
    await AuthTokenValidation
      .removeAsync({ meetingId, userId, connectionId: { $ne: connectionId } });
    const { numberAffected } = AuthTokenValidation.upsertAsync(selector, modifier);

    if (numberAffected) {
      Logger.info(`Upserted ${JSON.stringify(selector)} ${validationStatus} in AuthTokenValidation`);
    }
  } catch (err) {
    Logger.error(`Could not upsert to collection AuthTokenValidation: ${err}`);
  }
}
