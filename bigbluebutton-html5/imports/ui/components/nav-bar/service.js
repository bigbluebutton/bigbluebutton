import Auth from '/imports/ui/services/auth';
import Breakouts from '/imports/api/breakouts';

const getBreakouts = () => Breakouts.find().fetch();

const getBreakoutJoinURL = (breakout) => {
  const currentUserId = Auth.getCredentials().requesterUserId;

  if (breakout.users) {
    const user = breakout.users.find(user => user.userId === currentUserId);
    if (user) {
      const urlParams = user.urlParams;
      return [
        window.origin,
        'html5client/join',
        urlParams.meetingId,
        urlParams.userId,
        urlParams.authToken,
      ].join('/');
    }
  }
};

const getClientBuildInfo = () => {
  return {
    clientBuild: Meteor.settings.public.app.html5ClientBuild,
    copyright: Meteor.settings.public.app.copyright,
  };
};

export default {
  getBreakouts,
  getBreakoutJoinURL,
  getClientBuildInfo,
};
