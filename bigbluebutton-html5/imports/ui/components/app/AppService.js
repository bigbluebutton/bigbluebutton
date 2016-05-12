import Polls from '/imports/api/polls/polls';

function pollExists() {
  return !!(Polls.findOne({}));
}

export {
  pollExists,
};
