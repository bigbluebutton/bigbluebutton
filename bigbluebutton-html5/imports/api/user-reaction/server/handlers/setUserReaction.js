import addUserReaction from '../modifiers/addUserReaction';

export default function handleSetUserReaction({ body }, meetingId) {
  const { userId, reactionEmoji } = body;

  addUserReaction(meetingId, userId, reactionEmoji);
}
