import Auth from '/imports/ui/services/auth';
import Breakouts from '/imports/api/breakouts';

const getBreakouts = () => Breakouts.find().fetch();

const getBreakoutJoinURL = (breakout) => {
  const currentUserId = Auth.userID;

  if (breakout.users) {
    const user = breakout.users.find(u => u.userId === currentUserId);

    if (user) {
      return user.redirectToHtml5JoinURL;
    }
  }
  return '';
};

export default {
  getBreakouts,
  getBreakoutJoinURL,
};
