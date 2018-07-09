import Breakouts from '/imports/api/breakouts';

const getBreakouts = () => Breakouts.find({}, { sort: { sequence: 1 } }).fetch();

export default {
  getBreakouts,
};

