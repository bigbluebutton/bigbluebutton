import Polls from '/imports/api/polls/collection';
import { logger } from '/imports/startup/server/logger';

export function updatePollCollection(poll, meetingId, requesterId) {
  if ((poll.answers != null) && (poll.numResponders != null) && (poll.numRespondents != null) &&
    (poll.id != null) && (meetingId != null) && (requesterId != null)) {
    return Polls.update({
      meetingId: meetingId,
      requester: requesterId,
      poll: { id: poll.id },
    }, {
      $set: {
        poll: { answers: poll.answers },
        poll: { num_responders: poll.numResponders },
        poll: { num_respondents: poll.numRespondents },
      },
    }, logger.info(`updating Polls Collection (meetingId: ${meetingId}, pollId: ${poll.id}!)`));
  }
};
