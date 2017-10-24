import { makeCall } from '/imports/ui/services/api';
import Polls from '/imports/api/polls';

const mapPolls = function () {
  const poll = Polls.findOne({});
  if (!poll) {
    return { pollExists: false };
  }

  const amIRequester = poll.requester !== 'userId';

  return {
    poll: {
      answers: poll.answers,
      pollId: poll.id,
    },
    pollExists: true,
    amIRequester,
    handleVote(pollId, answerId) {
      makeCall('publishVote', pollId, answerId.id);
    },
  };
};

export default { mapPolls };
