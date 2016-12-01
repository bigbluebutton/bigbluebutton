import { callServer } from '/imports/ui/services/api';
import Polls from '/imports/api/polls';

let mapPolls = function () {
  let poll = Polls.findOne({});
  if (!poll) {
    return { pollExists: false };
  }

  const amIRequester = poll.requester != 'userId';

  return {
    poll: {
      answers: poll.poll.answers,
      pollId: poll.poll.id,
    },
    pollExists: true,
    amIRequester: amIRequester,
    handleVote: function (pollId, answerId) {
      callServer('publishVote', pollId, answerId.id);
    },
  };
};

export default { mapPolls };
