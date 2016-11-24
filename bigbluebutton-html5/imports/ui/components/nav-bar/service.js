import Auth from '/imports/ui/services/auth';
import Breakouts from '/imports/api/breakouts';

const getBreakouts = () => Breakouts.find().fetch();

export default {
  getBreakouts,
};
