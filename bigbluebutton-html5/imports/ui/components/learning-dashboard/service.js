import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/api/meetings';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

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
  const learningDashboardAccessToken = getLearningDashboardAccessToken();
  if (learningDashboardAccessToken !== null) {
    const lifetime = new Date();
    lifetime.setTime(lifetime.getTime() + (3600000)); // 1h (extends 7d when open Dashboard)
    document.cookie = `ld-${Auth.meetingID}=${getLearningDashboardAccessToken()}; expires=${lifetime.toGMTString()}; path=/`;
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
