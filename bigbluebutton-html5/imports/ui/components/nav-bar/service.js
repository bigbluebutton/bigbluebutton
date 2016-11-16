import Auth from '/imports/ui/services/auth';
import Breakouts from '/imports/api/breakouts';

const getBreakouts = () => {
  let breakouts = Breakouts.find().fetch();

  const breakout = breakouts.find(breakout => {
    if (!breakout.users) {
      return false;
    }

    return breakout.users.some(user => user.userId === Auth.getCredentials().requesterUserId);
  });
  return breakouts;
};

export default {
  getBreakouts,
};
