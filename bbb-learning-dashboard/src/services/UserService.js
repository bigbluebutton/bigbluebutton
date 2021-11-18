import { emojiConfigs, filterUserEmojis } from './EmojiService';

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

const tableHeaderFields = [
  {
    id: 'name',
    defaultMessage: 'Name',
  },
  {
    id: 'moderator',
    defaultMessage: 'Moderator',
  },
  {
    id: 'activityScore',
    defaultMessage: 'Activity Score',
  },
  {
    id: 'colTalk',
    defaultMessage: 'Talk Time',
  },
  {
    id: 'colWebcam',
    defaultMessage: 'Webcam Time',
  },
  {
    id: 'colMessages',
    defaultMessage: 'Messages',
  },
  {
    id: 'colEmojis',
    defaultMessage: 'Emojis',
  },
  {
    id: 'pollVotes',
    defaultMessage: 'Poll Votes',
  },
  {
    id: 'colRaiseHands',
    defaultMessage: 'Raise Hands',
  },
  {
    id: 'join',
    defaultMessage: 'Join',
  },
  {
    id: 'left',
    defaultMessage: 'Left',
  },
  {
    id: 'duration',
    defaultMessage: 'Duration',
  },
];

export function makeUserCSVData(users, polls, intl) {
  const userRecords = {};
  const userValues = Object.values(users || {});
  const pollValues = Object.values(polls || {});
  const skipEmojis = Object
    .keys(emojiConfigs)
    .filter((emoji) => emoji !== 'raiseHand')
    .join(',');

  for (let i = 0; i < userValues.length; i += 1) {
    const userFields = [];
    const webcam = getSumOfTime(userValues[i].webcams);
    const duration = userValues[i].leftOn > 0
      ? userValues[i].leftOn - userValues[i].registeredOn
      : (new Date()).getTime() - userValues[i].registeredOn;

    userFields.push(userValues[i].name);
    userFields.push(userValues[i].isModerator.toString().toUpperCase());
    userFields.push(intl.formatNumber(
      getActivityScore(userValues[i], userValues, Object.values(polls || {}).length),
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      },
    ));
    userFields.push(userValues[i].talk.totalTime > 0 ? tsToHHmmss(userValues[i].talk.totalTime) : '-');
    userFields.push(webcam > 0 ? tsToHHmmss(webcam) : '-');
    userFields.push(userValues[i].totalOfMessages);
    userFields.push(filterUserEmojis(userValues[i], 'raiseHand').length);
    userFields.push(Object.keys(userValues[i].answers).length);
    userFields.push(filterUserEmojis(userValues[i], skipEmojis).length);
    userFields.push(`"${intl.formatDate(userValues[i].registeredOn, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })}"`);
    userFields.push(`"${intl.formatDate(userValues[i].leftOn, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })}"`);
    userFields.push(tsToHHmmss(duration));
    for (let j = 0; j < pollValues.length; j += 1) {
      userFields.push(`"${userValues[i].answers[pollValues[j].pollId] || '-'}"`);
    }
    userRecords[userValues[i].intId] = userFields.join(',');
  }

  const tableHeaderFieldsTranslated = tableHeaderFields
    .map(({ id, defaultMessage }) => intl.formatMessage({
      id: `app.learningDashboard.usersTable.${id}`,
      defaultMessage,
    }));

  let header = tableHeaderFieldsTranslated.join(',');
  let anonymousRecord = intl.formatMessage({
    id: 'app.learningDashboard.pollsTable.anonymousRowName',
    defaultMessage: 'Anonymous',
  });

  // Skip the fields for the anonymous record
  for (let k = 0; k < header.split(',').length - 1; k += 1) {
    // empty fields
    anonymousRecord += ',""';
  }

  // Adds the anonymous answers
  for (let i = 0; i < pollValues.length; i += 1) {
    header += `,${pollValues[i].question || `Poll ${i + 1}`}`;
    anonymousRecord += `,"${pollValues[i].anonymousAnswers.join('\n')}"`;
  }
  userRecords.Anonymous = anonymousRecord;

  return [
    header,
    Object.values(userRecords).join('\n'),
  ].join('\n');
}
