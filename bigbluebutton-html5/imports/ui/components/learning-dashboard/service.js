import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import Meetings from '../../../api/meetings';

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
    { meetingId: Auth.meetingID },
    {
      fields: { 'password.learningDashboardAccessToken': 1 },
    },
  ) || {}).password || {}).learningDashboardAccessToken || null;

const openLearningDashboardUrl = (lang) => {
  window.open(`/learning-dashboard/?meeting=${Auth.meetingID}&report=${getLearningDashboardAccessToken()}&lang=${lang}`, '_blank');
};

export default {
  isModerator,
  getLearningDashboardAccessToken,
  openLearningDashboardUrl,
};
