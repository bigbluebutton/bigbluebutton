import { filterUserReactions } from './ReactionService';

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
  const usersRaiseHand = allUsersArr.map((currUser) => currUser?.raiseHand?.length || 0);
  const maxRaiseHand = Math.max(...usersRaiseHand);
  const userRaiseHand = user?.raiseHand?.length || 0;
  if (maxRaiseHand > 0) {
    userPoints += (userRaiseHand / maxRaiseHand) * 2;
  }

  // Calculate points of Reactions
  const usersReactions = allUsersArr.map((currUser) => currUser?.reactions?.length || 0);
  const maxReactions = Math.max(...usersReactions);
  const userReactions = user?.reactions?.length || 0;
  if (maxReactions > 0) {
    userPoints += (userReactions / maxReactions) * 2;
  }

  // Calculate points of Polls
  if (totalOfPolls > 0) {
    userPoints += (Object.values(user.answers || {}).length / totalOfPolls) * 2;
  }

  return userPoints;
}

// Merges a list of [start, end] intervals into sorted, non-overlapping intervals.
// Copies each interval so the caller's arrays are never mutated.
function mergeIntervals(intervals) {
  if (intervals.length === 0) return [];

  // Sort intervals by start time
  const sorted = intervals.map((i) => [i[0], i[1]]).sort((a, b) => a[0] - b[0]);

  const merged = [sorted[0]];
  for (let i = 1; i < sorted.length; i += 1) {
    const lastMerged = merged.at(-1);
    const current = sorted[i];
    if (current[0] <= lastMerged[1]) {
      // Overlapping intervals, union them
      lastMerged[1] = Math.max(lastMerged[1], current[1]);
    } else {
      merged.push(current);
    }
  }

  return merged;
}

export function getSumOfTime(eventsArr) {
  return eventsArr.reduce((prevVal, elem) => {
    if (elem?.sessions) {
      return prevVal + elem.sessions.reduce((prevVal2, session) => {
        if (session.leftOn > 0) {
          return prevVal2 + (session.leftOn - session.registeredOn);
        }
        return prevVal2 + (new Date().getTime() - session.registeredOn);
      }, 0);
    }
    if ((elem.stoppedOn || elem.leftOn) > 0) {
      return prevVal + ((elem.stoppedOn || elem.leftOn) - (elem.startedOn || elem.registeredOn));
    }
    return prevVal + (new Date().getTime() - (elem.startedOn || elem.registeredOn));
  }, 0);
}

// Sums a user's webcam time, clamped to the intervals the user was actually online.
// Defends against inconsistent data where a webcam's stoppedOn extends past the user's
// session (e.g. a cam-stopped event missed by the backend), which would otherwise make
// "webcam time" exceed "online time" in the report.
export function getWebcamSumOfTime(user) {
  const webcams = user?.webcams || [];
  if (webcams.length === 0) return 0;

  const now = Date.now();

  const onlineIntervals = mergeIntervals(
    Object.values(user.intIds || {}).flatMap((intIdObj) => (
      (intIdObj.sessions || []).map((session) => [
        session.registeredOn,
        session.leftOn > 0 ? session.leftOn : now,
      ])
    )),
  );
  if (onlineIntervals.length === 0) return 0;

  const webcamIntervals = mergeIntervals(
    webcams.map((webcam) => [
      webcam.startedOn,
      webcam.stoppedOn > 0 ? webcam.stoppedOn : now,
    ]),
  );

  // Both interval sets are merged (non-overlapping), so summing the pairwise
  // intersections counts each overlapping millisecond exactly once.
  let total = 0;
  webcamIntervals.forEach(([wStart, wEnd]) => {
    onlineIntervals.forEach(([oStart, oEnd]) => {
      const start = Math.max(wStart, oStart);
      const end = Math.min(wEnd, oEnd);
      if (end > start) total += end - start;
    });
  });

  return total;
}

export function getJoinTime(eventsArr) {
  return eventsArr.reduce((prevVal, elem) => {
    if (prevVal === 0 || elem.sessions[0].registeredOn < prevVal) {
      return elem.sessions[0].registeredOn;
    }
    return prevVal;
  }, 0);
}

export function getLeaveTime(eventsArr) {
  return eventsArr.reduce((prevVal, elem) => {
    if (elem.sessions[elem.sessions.length - 1].leftOn > prevVal) {
      return elem.sessions[elem.sessions.length - 1].leftOn;
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
    id: 'colReactions',
    defaultMessage: 'Reactions',
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

  for (let i = 0; i < userValues.length; i += 1) {
    const user = userValues[i];
    const webcam = getWebcamSumOfTime(user);
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
      reactions: filterUserReactions(user).length,
      answers: Object.keys(user.answers).length,
      raiseHand: user.raiseHand.length,
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
    // Add the poll question headers (remove spaces and line breaks)
    header += `,${pollValues[i].question.replace(/\s+/g, ' ').trim() || `Poll ${i + 1}`}`;

    // Add the anonymous answers
    anonymousRecord += `,"${pollValues[i].anonymousAnswers.join('\r\n')}"`;
  }
  if (pollValues.some((poll) => poll.anonymous)) {
    userRecords.Anonymous = anonymousRecord;
  }

  return [
    header,
    Object.values(userRecords).join('\r\n'),
  ].join('\r\n');
}
