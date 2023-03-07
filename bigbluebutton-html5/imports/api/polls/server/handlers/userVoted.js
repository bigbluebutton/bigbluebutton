import { check } from 'meteor/check';
import updateVotes from '../modifiers/updateVotes';

export default async function userVoted({ body }, meetingId) {
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

  const result = await updateVotes(poll, meetingId);

  return result;
}
