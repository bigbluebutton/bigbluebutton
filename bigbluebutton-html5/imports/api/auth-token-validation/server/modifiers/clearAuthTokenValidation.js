import AuthTokenValidation from '/imports/api/auth-token-validation';
import Logger from '/imports/startup/server/logger';
import ClientConnections from '/imports/startup/server/ClientConnections';

export default function clearAuthTokenValidation(meetingId) {
  return AuthTokenValidation.remove({ meetingId }, (err, num) => {
    if (err) {
      Logger.info(`Error when removing auth-token-validation for meeting=${meetingId}`);
    }

    if (!process.env.BBB_HTML5_ROLE || process.env.BBB_HTML5_ROLE === 'frontend') {
      ClientConnections.removeMeeting(meetingId);
    }
    Logger.info(`Cleared AuthTokenValidation (${meetingId})`);
  });
}
