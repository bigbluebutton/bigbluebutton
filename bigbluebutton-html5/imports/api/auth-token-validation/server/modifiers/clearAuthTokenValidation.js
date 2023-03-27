import AuthTokenValidation from '/imports/api/auth-token-validation';
import Logger from '/imports/startup/server/logger';
import ClientConnections from '/imports/startup/server/ClientConnections';

export default async function clearAuthTokenValidation(meetingId) {
  try {
    await AuthTokenValidation.removeAsync({ meetingId });
    if (!process.env.BBB_HTML5_ROLE || process.env.BBB_HTML5_ROLE === 'frontend') {
      ClientConnections.removeMeeting(meetingId);
    }
    Logger.info(`Cleared AuthTokenValidation (${meetingId})`);
  } catch (error) {
    Logger.info(`Error when removing auth-token-validation for meeting=${meetingId}`);
  }
}
