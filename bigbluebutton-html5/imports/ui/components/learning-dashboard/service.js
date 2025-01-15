import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/api/meetings';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const findCommonDomain = (url1, url2) => {
  // Helper function to extract domain parts in reverse order
  const getDomainParts = (url) => {
    try {
      const { hostname } = new URL(url);
      return hostname.split('.').reverse();
    } catch (e) {
      throw new Error('Invalid URL format');
    }
  };

  try {
    const domain1Parts = getDomainParts(url1);
    const domain2Parts = getDomainParts(url2);

    // Find common parts starting from the end (TLD)
    const commonParts = [];
    const minLength = Math.min(domain1Parts.length, domain2Parts.length);

    for (let i = 0; i < minLength; i += 1) {
      if (domain1Parts[i] === domain2Parts[i]) {
        commonParts.push(domain1Parts[i]);
      } else {
        break;
      }
    }

    // Return the common parts in correct order
    // Add leading dot if domains are different in any way
    if (commonParts.length > 1) {
      return commonParts.reverse().join('.');
    }
    return '';
  } catch (error) {
    return '';
  }
};

const isModerator = () => {
  const user = Users.findOne(
    {
      meetingId: Auth.meetingID,
      userId: Auth.userID,
    },
    { fields: { role: 1 } },
  );

  if (user && user.role === ROLE_MODERATOR) {
    return true;
  }

  return false;
};

const getLearningDashboardAccessToken = () => ((
  Meetings.findOne(
    { meetingId: Auth.meetingID, learningDashboardAccessToken: { $exists: true } },
    {
      fields: { learningDashboardAccessToken: 1 },
    },
  ) || {}).learningDashboardAccessToken || null);

const setLearningDashboardCookie = () => {
  const learningDashboardBase = Meteor.settings.public.app?.learningDashboardBase;
  const learningDashboardAccessToken = getLearningDashboardAccessToken();
  if (learningDashboardAccessToken !== null) {
    const lifetime = new Date();
    lifetime.setTime(lifetime.getTime() + (3600000)); // 1h (extends 7d when open Dashboard)
    let cookieString = `ld-${Auth.meetingID}=${getLearningDashboardAccessToken()}; expires=${lifetime.toUTCString()}; path=/`;

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

const openLearningDashboardUrl = (lang) => {
  const APP = Meteor.settings.public.app;
  if (getLearningDashboardAccessToken() && setLearningDashboardCookie()) {
    window.open(`${APP.learningDashboardBase}/?meeting=${Auth.meetingID}&lang=${lang}`, '_blank');
  } else {
    window.open(`${APP.learningDashboardBase}/?meeting=${Auth.meetingID}&sessionToken=${Auth.sessionToken}&lang=${lang}`, '_blank');
  }
};

export default {
  isModerator,
  getLearningDashboardAccessToken,
  setLearningDashboardCookie,
  openLearningDashboardUrl,
};
