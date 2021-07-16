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

const getActivityReportAccessToken = () => {
  let activityReportAccessToken = null;

  const meetingId = Auth.meetingID;
  const meetingObject = Meetings.findOne({
    meetingId,
  }, { fields: { 'password.activityReportAccessToken': 1 } });

  if (meetingObject != null) {
    if (meetingObject.password && meetingObject.password.activityReportAccessToken) {
      activityReportAccessToken = meetingObject.password.activityReportAccessToken;
    }
  }

  return activityReportAccessToken;
};

const openActivityReportUrl = () => {
  window.open(`/activity-report/?meeting=${Auth.meetingID}&report=${getActivityReportAccessToken()}`, '_blank');
};

export default {
  isModerator,
  getActivityReportAccessToken,
  openActivityReportUrl,
};
