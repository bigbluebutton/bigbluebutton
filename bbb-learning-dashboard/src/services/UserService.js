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
    if ((elem.stoppedOn || elem.leftOn) > 0) {
      return prevVal + ((elem.stoppedOn || elem.leftOn) - (elem.startedOn || elem.registeredOn));
    }
    return prevVal + (new Date().getTime() - (elem.startedOn || elem.registeredOn));
  }, 0);
}

export function getJoinTime(eventsArr) {
  return eventsArr.reduce((prevVal, elem) => {
    if (prevVal === 0 || elem.registeredOn < prevVal) {
      return elem.registeredOn;
    }
    return prevVal;
  }, 0);
}

export function getLeaveTime(eventsArr) {
  return eventsArr.reduce((prevVal, elem) => {
    if (elem.leftOn > prevVal) {
      return elem.leftOn;
    }
    return prevVal;
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
    const user = userValues[i];
    const webcam = getSumOfTime(user.webcams);
    const duration = getSumOfTime(Object.values(user.intIds));
    const joinTime = getJoinTime(Object.values(user.intIds));
    const leaveTime = getLeaveTime(Object.values(user.intIds));

    const userData = {
      name: user.name,
      moderator: user.isModerator.toString().toUpperCase(),
      activityScore: intl.formatNumber(
        getActivityScore(user, userValues, Object.values(polls || {}).length),
        {
          minimumFractionDigits: 0,
          maximumFractionDigits: 1,
        },
      ),
      talk: user.talk.totalTime > 0 ? tsToHHmmss(user.talk.totalTime) : '-',
      webcam: webcam > 0 ? tsToHHmmss(webcam) : '-',
      messages: user.totalOfMessages,
      raiseHand: filterUserEmojis(user, 'raiseHand').length,
      answers: Object.keys(user.answers).length,
      emojis: filterUserEmojis(user, skipEmojis).length,
      registeredOn: intl.formatDate(joinTime, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      leftOn: leaveTime > 0 ? intl.formatDate(leaveTime, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }) : '-',
      duration: tsToHHmmss(duration),
    };

    for (let j = 0; j < pollValues.length; j += 1) {
      userData[`Poll_${j}`] = user.answers[pollValues[j].pollId] || '-';
    }

    const userFields = Object
      .values(userData)
      .map((data) => `"${data}"`);

    userRecords[user.userKey] = userFields.join(',');
  }

  const tableHeaderFieldsTranslated = tableHeaderFields
    .map(({ id, defaultMessage }) => intl.formatMessage({
      id: `app.learningDashboard.usersTable.${id}`,
      defaultMessage,
    }));

  let header = tableHeaderFieldsTranslated.join(',');
  let anonymousRecord = `"${intl.formatMessage({
    id: 'app.learningDashboard.pollsTable.anonymousRowName',
    defaultMessage: 'Anonymous',
  })}"`;

  // Skip the fields for the anonymous record
  for (let k = 0; k < header.split(',').length - 1; k += 1) {
    // Empty fields
    anonymousRecord += ',""';
  }

  for (let i = 0; i < pollValues.length; i += 1) {
    // Add the poll question headers
    header += `,${pollValues[i].question || `Poll ${i + 1}`}`;

    // Add the anonymous answers
    anonymousRecord += `,"${pollValues[i].anonymousAnswers.join('\r\n')}"`;
  }
  userRecords.Anonymous = anonymousRecord;

  return [
    header,
    Object.values(userRecords).join('\r\n'),
  ].join('\r\n');
}
