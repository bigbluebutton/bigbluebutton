const mentionRegex = /@[^@]+/;

function findAndReplaceMentions(msg: string, userNames: string[]) {
  // Check if there are any possible mentions.
  // That way, we avoid iterating over all users unnecessarily.
  if (mentionRegex.test(msg)) {
    return userNames.reduce((acc, username) => {
      const userNameRegex = new RegExp(`@${username}`, 'gi');
      return acc.replaceAll(userNameRegex, `[@${username}](mention://placeholder)`);
    }, msg);
  }
  return msg;
}

export {
  findAndReplaceMentions,
};

export default {
  findAndReplaceMentions,
};
