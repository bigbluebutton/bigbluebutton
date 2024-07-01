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

export const MeetingEndedTable = {
  ENDED_FROM_API: 'ENDED_FROM_API',
  ENDED_WHEN_NOT_JOINED: 'ENDED_WHEN_NOT_JOINED',
  ENDED_WHEN_LAST_USER_LEFT: 'ENDED_WHEN_LAST_USER_LEFT',
  ENDED_AFTER_USER_LOGGED_OUT: 'ENDED_AFTER_USER_LOGGED_OUT',
  ENDED_AFTER_EXCEEDING_DURATION: 'ENDED_AFTER_EXCEEDING_DURATION',
  BREAKOUT_ENDED_EXCEEDING_DURATION: 'BREAKOUT_ENDED_EXCEEDING_DURATION',
  BREAKOUT_ENDED_BY_MOD: 'BREAKOUT_ENDED_BY_MOD',
  ENDED_DUE_TO_NO_AUTHED_USER: 'ENDED_DUE_TO_NO_AUTHED_USER',
  ENDED_DUE_TO_NO_MODERATOR: 'ENDED_DUE_TO_NO_MODERATOR',
  ENDED_DUE_TO_SERVICE_INTERRUPTION: 'ENDED_DUE_TO_SERVICE_INTERRUPTION',
};

export const openLearningDashboardUrl = (
  accessToken: string,
  mId: string,
  sToken:string,
  learningDashboardBase: string,
  lang: string,
) => {
  if (accessToken && setLearningDashboardCookie(accessToken, mId)) {
    window.open(`${learningDashboardBase}/?meeting=${mId}&lang=${lang}`, '_blank');
  } else {
    window.open(`${learningDashboardBase}/?meeting=${mId}&sessionToken=${sToken}&lang=${lang}`, '_blank');
  }
};

export const setLearningDashboardCookie = (accessToken: string, mId: string) => {
  if (accessToken !== null) {
    const lifetime = new Date();
    lifetime.setTime(lifetime.getTime() + (3600000)); // 1h (extends 7d when open Dashboard)
    document.cookie = `ld-${mId}=${accessToken}; expires=${lifetime.toUTCString()}; path=/`;
    return true;
  }
  return false;
};

export default {
  JoinErrorCodeTable,
  MeetingEndedTable,
  setLearningDashboardCookie,
  openLearningDashboardUrl,
};
