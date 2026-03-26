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
  const usersRaiseHand = allUsersArr.map((currUser) => currUser.raiseHand.length);
  const maxRaiseHand = Math.max(...usersRaiseHand);
  const userRaiseHand = user.raiseHand.length;
  if (maxRaiseHand > 0) {
    userPoints += (userRaiseHand / maxRaiseHand) * 2;
  }

  // Calculate points of Reactions
  const usersReactions = allUsersArr.map((currUser) => currUser.reactions.length);
  const maxReactions = Math.max(...usersReactions);
  const userReactions = user.reactions.length;
  if (maxReactions > 0) {
    userPoints += (userReactions / maxReactions) * 2;
  }

  // Calculate points of Polls
  if (totalOfPolls > 0) {
    userPoints += (Object.values(user.answers || {}).length / totalOfPolls) * 2;
  }

  return userPoints;
}

export function getSumOfTime(eventsArr) {
  const intervals = [];
  const now = Date.now();

  eventsArr.forEach((elem) => {
    if (elem?.sessions) {
      elem.sessions.forEach((session) => {
        const start = session.registeredOn;
        const end = session.leftOn > 0 ? session.leftOn : now;
        intervals.push([start, end]);
      });
    } else {
      const start = elem.startedOn || elem.registeredOn;
      const end = (elem.stoppedOn || elem.leftOn) > 0 ? (elem.stoppedOn || elem.leftOn) : now;
      intervals.push([start, end]);
    }
  });

  if (intervals.length === 0) return 0;

  // Sort intervals by start time
  intervals.sort((a, b) => a[0] - b[0]);

  const merged = [intervals[0]];
  for (let i = 1; i < intervals.length; i += 1) {
    const lastMerged = merged.at(-1);
    const current = intervals[i];
    if (current[0] <= lastMerged[1]) {
      // Overlapping intervals, union them securely
      lastMerged[1] = Math.max(lastMerged[1], current[1]);
    } else {
      merged.push(current);
    }
  }

  // Sum all distinctly separate times
  return merged.reduce((sum, [start, end]) => sum + (end - start), 0);
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
  userRecords.Anonymous = anonymousRecord;

  return [
    header,
    Object.values(userRecords).join('\r\n'),
  ].join('\r\n');
}

// Helper to extract a single flat array of all session objects across all internal IDs of a user
const getSessions = (user) => {
  const sessions = [];
  Object.values(user.intIds || {}).forEach((intIdObj) => {
    if (intIdObj.sessions) {
      sessions.push(...intIdObj.sessions);
    }
  });
  return sessions;
};

// Checks if two user objects have sessions that genuinely run in parallel.
// Overlaps shorter than `overlapThreshold` are considered "ghost connections"
// (where a dropping connection overlaps briefly with a new connection) and return false.
const hasRealOverlap = (u1, u2, endedOn, overlapThreshold) => {
  const s1 = getSessions(u1);
  const s2 = getSessions(u2);
  // eslint-disable-next-line no-restricted-syntax
  for (const sa of s1) {
    // eslint-disable-next-line no-restricted-syntax
    for (const sb of s2) {
      // Find the intersection window between the two sessions
      const start = Math.max(sa.registeredOn, sb.registeredOn);
      const endA = sa.leftOn > 0 ? sa.leftOn : (endedOn || Date.now());
      const endB = sb.leftOn > 0 ? sb.leftOn : (endedOn || Date.now());
      const end = Math.min(endA, endB);

      // If intersection lasts longer than threshold, it is a real concurrent overlap
      if (end - start > overlapThreshold) {
        return true;
      }
    }
  }
  return false;
};

// Consolidates all metrics and sessions from `otherUser` into `mainUser`
// eslint-disable-next-line no-param-reassign
const mergeTwoUsers = (mainUser, otherUser) => {
  const mergedUser = mainUser;

  // Merge internal IDs (sessions will be combined)
  mergedUser.intIds = { ...mergedUser.intIds, ...otherUser.intIds };

  // Accumulate time counters safely without accidentally discarding metadata
  mergedUser.talk.totalTime = (mergedUser.talk.totalTime || 0) + (otherUser.talk.totalTime || 0);
  mergedUser.talk.lastTalkStartedOn = Math.max(
    mergedUser.talk.lastTalkStartedOn || 0,
    otherUser.talk.lastTalkStartedOn || 0,
  );

  // Merge array-based interactions mapping (polls, messages, hands raised)
  const concatArrays = (arr1, arr2) => [...(arr1 || []), ...(arr2 || [])];
  mergedUser.reactions = concatArrays(mergedUser.reactions, otherUser.reactions);
  mergedUser.raiseHand = concatArrays(mergedUser.raiseHand, otherUser.raiseHand);
  mergedUser.away = concatArrays(mergedUser.away, otherUser.away);
  mergedUser.webcams = concatArrays(mergedUser.webcams, otherUser.webcams);

  // Aggregate scalar counters
  mergedUser.totalOfMessages = (mergedUser.totalOfMessages || 0)
    + (otherUser.totalOfMessages || 0);
  mergedUser.totalOfSharedNotes = (mergedUser.totalOfSharedNotes || 0)
    + (otherUser.totalOfSharedNotes || 0);
  mergedUser.totalOfWhiteboardAnnotations = (mergedUser.totalOfWhiteboardAnnotations || 0)
    + (otherUser.totalOfWhiteboardAnnotations || 0);

  // Merge poll answers
  mergedUser.answers = { ...mergedUser.answers, ...otherUser.answers };

  // Merge plugin data and last-seen state
  mergedUser.pluginUserData = { ...mergedUser.pluginUserData, ...otherUser.pluginUserData };
  mergedUser.leftOn = (mergedUser.leftOn === 0 || otherUser.leftOn === 0)
    ? 0
    : Math.max(mergedUser.leftOn || 0, otherUser.leftOn || 0);

  // Promote privilege if either session had moderator rights
  mergedUser.isModerator = mergedUser.isModerator || otherUser.isModerator;

  return mergedUser;
};

const getFirstReg = (u) => {
  const sessions = getSessions(u);
  if (!sessions.length) return Number.MAX_VALUE;
  return Math.min(...sessions.map((s) => s.registeredOn));
};

/**
 * Merges duplicate user entries caused by rapid reconnects (ghost connections)
 * while keeping genuinely concurrent sessions (e.g., dual-device usage) separate.
 *
 * @param {Object} activitiesJson - The full JSON data object containing meeting and user activities
 * @param {number} overlapThreshold - Maximum overlap duration in ms to be counted as concurrent
 * @returns {Object} A new activities object with correctly merged user sessions
 */
export function mergeOverlappingUsers(activitiesJson, overlapThreshold = 210000) {
  if (!activitiesJson?.users) return activitiesJson;
  const newActivivies = activitiesJson;

  // Group users by their external ID to find duplicate entries for the same physical person
  const extIdGroups = {};
  const newUsers = {};

  Object.entries(newActivivies.users).forEach(([userKey, user]) => {
    if (user.extId) {
      if (!extIdGroups[user.extId]) extIdGroups[user.extId] = [];
      extIdGroups[user.extId].push({ ...user });
    } else {
      newUsers[userKey] = user;
    }
  });

  // Process all instances of each unique extId
  // eslint-disable-next-line no-restricted-syntax
  for (const extId of Object.keys(extIdGroups)) {
    const users = extIdGroups[extId];

    // Sort to consistently process the oldest user session first
    users.sort((a, b) => getFirstReg(a) - getFirstReg(b));

    // Merge logic: try joining to an existing profile unless there is a real overlap
    const mergedList = [];
    users.forEach((u) => {
      // Find a previously merged instance that does NOT have a real overlap and combine them
      const placed = mergedList.some((m) => {
        if (!hasRealOverlap(m, u, activitiesJson.endedOn, overlapThreshold)) {
          mergeTwoUsers(m, u);
          return true;
        }
        return false;
      });

      // If we couldn't merge (meaning this is a real parallel session), keep them separate
      if (!placed) mergedList.push(u);
    });

    // Bring the finalized, merged users into the global return object.
    // We sort their internal IDs chronologically so they cluster naturally in by time.
    mergedList.forEach((u) => {
      if (u.intIds) {
        const sortedIntIds = {};
        Object.entries(u.intIds)
          .sort(([, a], [, b]) => {
            const tA = a.sessions?.[0]?.registeredOn || 0;
            const tB = b.sessions?.[0]?.registeredOn || 0;
            return tA - tB;
          })
          .forEach(([key, val]) => {
            sortedIntIds[key] = val;
          });
        // eslint-disable-next-line no-param-reassign
        u.intIds = sortedIntIds;
      }
      newUsers[u.userKey] = u;
    });
  }

  newActivivies.users = newUsers;
  return newActivivies;
}
