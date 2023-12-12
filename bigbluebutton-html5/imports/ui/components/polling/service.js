import Polls from '/imports/api/polls';

const MAX_CHAR_LENGTH = 5;

const mapPolls = () => {
  const poll = Polls.findOne({});
  if (!poll) {
    return { pollExists: false };
  }

  const { answers } = poll;
  let stackOptions = false;

  answers.map((obj) => {
    if (stackOptions) return obj;
    if (obj.key && obj.key.length > MAX_CHAR_LENGTH) {
      stackOptions = true;
    }
    return obj;
  });

  const amIRequester = poll.requester !== 'userId';

  return {
    poll: {
      answers: poll.answers,
      pollId: poll.id,
      isMultipleResponse: poll.isMultipleResponse,
      pollType: poll.pollType,
      stackOptions,
      question: poll.question,
      secretPoll: poll.secretPoll,
    },
    pollExists: true,
    amIRequester,
  };
};

export default { mapPolls };
