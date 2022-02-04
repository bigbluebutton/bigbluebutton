import { check } from 'meteor/check';
import updateVotes from '../modifiers/updateVotes';

export default function userVoted({ body }, meetingId) {
  const { poll } = body;

  check(meetingId, String);
  check(poll, {
    id: String,
    questionType: String,
    questionText: String,
    answers: [
      {
        id: Number,
        key: String,
        numVotes: Number,
      },
    ],
    numRespondents: Number,
    numResponders: Number,
  });

  return updateVotes(poll, meetingId);
}
