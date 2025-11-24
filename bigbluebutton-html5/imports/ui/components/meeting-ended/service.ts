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

const findCommonDomain = (url1: string, url2: string): string => {
  // Helper function to extract domain parts in reverse order
  const getDomainParts = (url: string): string[] => {
    try {
      const { hostname } = new URL(url);
      return hostname.split('.').reverse();
    } catch (e) {
      throw new Error(`Invalid URL format: ${url}`);
    }
  };

  try {
    const domain1Parts: string[] = getDomainParts(url1);
    const domain2Parts: string[] = getDomainParts(url2);

    // Find common parts starting from the end (TLD)
    const commonParts: string[] = [];
    const minLength: number = Math.min(domain1Parts.length, domain2Parts.length);

    for (let i = 0; i < minLength; i += 1) {
      if (domain1Parts[i] === domain2Parts[i]) {
        commonParts.push(domain1Parts[i]);
      } else {
        break;
      }
    }

    // Return the common parts in correct order
    if (commonParts.length > 0) {
      return commonParts.reverse().join('.');
    }
    return '';
  } catch (error) {
    return '';
  }
};

export const openLearningDashboardUrl = (
  accessToken: string,
  mId: string,
  sToken:string,
  learningDashboardBase: string,
  lang: string,
) => {
  if (accessToken && setLearningDashboardCookie(accessToken, mId, learningDashboardBase)) {
    window.open(`${learningDashboardBase}/?meeting=${mId}&lang=${lang}`, '_blank');
  } else {
    window.open(`${learningDashboardBase}/?meeting=${mId}&sessionToken=${sToken}&lang=${lang}`, '_blank');
  }
};

export const setLearningDashboardCookie = (accessToken: string, mId: string, learningDashboardBase: string) => {
  if (accessToken !== null) {
    const lifetime = new Date();
    lifetime.setTime(lifetime.getTime() + (3600000)); // 1h (extends 7d when open Dashboard)
    let cookieString = `ld-${mId}=${accessToken}; expires=${lifetime.toUTCString()}; path=/`;

    // In a cluster setup it will be necessary to specify the root domain
    // because the Dashboard might be in a different subdomain
    if (learningDashboardBase && learningDashboardBase.startsWith('http')) {
      const commonDomain = findCommonDomain(learningDashboardBase, window.location.href);
      if (commonDomain !== '') {
        cookieString += `;domain=${commonDomain}`;
      }
    }
    document.cookie = cookieString;
    return true;
  }
  return false;
};

export const allowRedirectToLogoutURL = (logoutURL: string) => {
  const ALLOW_DEFAULT_LOGOUT_URL = window.meetingClientSettings.public.app.allowDefaultLogoutUrl;
  const protocolPattern = /^((http|https):\/\/)/;

  if (logoutURL) {
    // default logoutURL
    // compare only the host to ignore protocols
    const urlWithoutProtocolForAuthLogout = logoutURL.replace(protocolPattern, '');
    const urlWithoutProtocolForLocationOrigin = window.location.origin.replace(protocolPattern, '');
    if (urlWithoutProtocolForAuthLogout === urlWithoutProtocolForLocationOrigin) {
      return ALLOW_DEFAULT_LOGOUT_URL;
    }
    // custom logoutURL
    return true;
  }

  // no logout url
  return false;
};

export default {
  JoinErrorCodeTable,
  MeetingEndedTable,
  setLearningDashboardCookie,
  openLearningDashboardUrl,
  allowRedirectToLogoutURL,
};
