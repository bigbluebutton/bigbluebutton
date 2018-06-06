import Breakouts from '/imports/api/breakouts';

const getBreakouts = () => Breakouts.find().fetch();

const getBreakoutJoinURL = breakout =>
  // experimental
  breakout.redirectToHtml5JoinURL;
export default {
  getBreakouts,
  getBreakoutJoinURL,
};
