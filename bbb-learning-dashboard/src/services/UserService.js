export function getActivityScore(user, allUsers, totalOfPolls) {
  if (user.isModerator) return 0;

  const allUsersArr = Object.values(allUsers || {}).filter((currUser) => !currUser.isModerator);
  let userPoints = 0;

  // Calculate points of Talking
  const usersTalkTime = allUsersArr.map((currUser) => currUser.talk.totalTime);
  const maxTalkTime = Math.max(...usersTalkTime);
  if (maxTalkTime > 0) {
    userPoints += (user.talk.totalTime / maxTalkTime) * 2;
  }

  // Calculate points of Chatting
  const usersTotalOfMessages = allUsersArr.map((currUser) => currUser.totalOfMessages);
  const maxMessages = Math.max(...usersTotalOfMessages);
  if (maxMessages > 0) {
    userPoints += (user.totalOfMessages / maxMessages) * 2;
  }

  // Calculate points of Raise hand
  const usersRaiseHand = allUsersArr.map((currUser) => currUser.emojis.filter((emoji) => emoji.name === 'raiseHand').length);
  const maxRaiseHand = Math.max(...usersRaiseHand);
  const userRaiseHand = user.emojis.filter((emoji) => emoji.name === 'raiseHand').length;
  if (maxRaiseHand > 0) {
    userPoints += (userRaiseHand / maxRaiseHand) * 2;
  }

  // Calculate points of Emojis
  const usersEmojis = allUsersArr.map((currUser) => currUser.emojis.filter((emoji) => emoji.name !== 'raiseHand').length);
  const maxEmojis = Math.max(...usersEmojis);
  const userEmojis = user.emojis.filter((emoji) => emoji.name !== 'raiseHand').length;
  if (maxEmojis > 0) {
    userPoints += (userEmojis / maxEmojis) * 2;
  }

  // Calculate points of Polls
  if (totalOfPolls > 0) {
    userPoints += (Object.values(user.answers || {}).length / totalOfPolls) * 2;
  }

  return userPoints;
}

export function getSumOfTime(eventsArr) {
  return eventsArr.reduce((prevVal, elem) => {
    if (elem.stoppedOn > 0) return prevVal + (elem.stoppedOn - elem.startedOn);
    return prevVal + (new Date().getTime() - elem.startedOn);
  }, 0);
}

export function tsToHHmmss(ts) {
  return (new Date(ts).toISOString().substr(11, 8));
}
