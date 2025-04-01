export function getUserReactionsSummary(user) {
  const userReactions = {};
  user.reactions.forEach((reaction) => {
    if (typeof userReactions[reaction.name] === 'undefined') {
      userReactions[reaction.name] = 0;
    }
    userReactions[reaction.name] += 1;
  });
  return userReactions;
}

export function filterUserReactions(user, start = null, end = null) {
  const userReactions = [];
  user.reactions.forEach((reaction) => {
    if (start != null && reaction.sentOn < start) return;
    if (end != null && reaction.sentOn > end) return;
    userReactions.push(reaction);
  });
  return userReactions;
}
