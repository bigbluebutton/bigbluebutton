import Breakouts from '/imports/api/breakouts';

const getBreakouts = () => Breakouts.find().fetch().sort((a, b) => a.sequence > b.sequence);

export default {
  getBreakouts,
};

