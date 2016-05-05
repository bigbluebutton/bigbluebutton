import { Polls } from '/collections/collections';

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
      Meteor.call('publishVoteMessage', pollId, answerId.id, 'getMeetingId',
        'userId', 'authToken');
    },
  };
};

export default { mapPolls };
