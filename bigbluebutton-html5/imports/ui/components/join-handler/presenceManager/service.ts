import Storage from '/imports/ui/services/storage/session';

export const JoinErrorCodeTable = {
  NOT_EJECT: 'not_eject_reason',
  DUPLICATE_USER: 'duplicate_user_in_meeting_eject_reason',
  PERMISSION_FAILED: 'not_enough_permission_eject_reason',
  EJECT_USER: 'user_requested_eject_reason',
  SYSTEM_EJECT_USER: 'system_requested_eject_reason',
  VALIDATE_TOKEN: 'validate_token_failed_eject_reason',
  USER_INACTIVITY: 'user_inactivity_eject_reason',
  BANNED_USER_REJOINING: 'banned_user_rejoining_reason',
  USER_LOGGED_OUT: 'user_logged_out_reason',
  MAX_PARTICIPANTS: 'max_participants_reason',
};

export const setUserDataToSessionStorage = (userData: {
  meetingId: string,
  userId: string,
  authToken: string,
  logoutUrl: string,
  sessionToken: string,
  userName: string,
  extId: string,
  meetingName: string,
  customLogoUrl: string,
  customDarkLogoUrl: string,
}) => {
  sessionStorage.setItem('meetingId', userData.meetingId);
  sessionStorage.setItem('userId', userData.userId);
  sessionStorage.setItem('logoutUrl', userData.logoutUrl);
  sessionStorage.setItem('sessionToken', userData.sessionToken);
  sessionStorage.setItem('userName', userData.userName);
  sessionStorage.setItem('extId', userData.extId);
  sessionStorage.setItem('meetingName', userData.meetingName);
  Storage.setItem('CustomLogoUrl', userData.customLogoUrl);
  Storage.setItem('CustomDarkLogoUrl', userData.customDarkLogoUrl);
};

export default {
  JoinErrorCodeTable,
  setUserDataToSessionStorage,
};
