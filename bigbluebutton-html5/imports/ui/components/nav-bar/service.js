import Breakouts from '/imports/api/breakouts';

const getBreakouts = () => Breakouts.find().fetch();

const getBreakoutJoinURL = breakout =>
  // experimental
  breakout.noRedirectJoinURL;
export default {
  getBreakouts,
  getBreakoutJoinURL,
};
