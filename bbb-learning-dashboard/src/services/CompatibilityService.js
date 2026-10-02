// Transforms the activities json into the shape the components expect, repairing
// inconsistencies left by the versions that generated it. Runs once at the fetch
// boundary so components can read the data as-is.

const OPEN = Number.POSITIVE_INFINITY;

// Merges [start, end] intervals into sorted, non-overlapping ones.
function mergeIntervals(intervals) {
  if (intervals.length === 0) return [];

  const sorted = intervals.map((i) => [i[0], i[1]]).sort((a, b) => a[0] - b[0]);

  const merged = [sorted[0]];
  for (let i = 1; i < sorted.length; i += 1) {
    const lastMerged = merged[merged.length - 1];
    const current = sorted[i];
    if (current[0] <= lastMerged[1]) {
      lastMerged[1] = Math.max(lastMerged[1], current[1]);
    } else {
      merged.push(current);
    }
  }

  return merged;
}

// Older jsons stored a single session per intId instead of a sessions array.
function convertUserSessionsFormat(activitiesJson) {
  const newActivities = activitiesJson;

  Object.values(newActivities.users || {}).forEach((user) => {
    Object.values(user.intIds || {}).forEach((intId) => {
      if (!intId?.sessions && intId?.registeredOn) {
        const newIntId = intId;
        newIntId.sessions = [
          { registeredOn: intId.registeredOn, leftOn: intId.leftOn },
        ];
      }
    });
  });

  return newActivities;
}

// Replaces each user's webcams with the same intervals unioned and clipped to the
// time the user was actually online.
//
// A webcam can outlast its user's session when a cam-stopped event doesn't reach the
// server, leaving the entry open until it's clamped to the user's exit. Overlapping
// entries are a second source of inflation: the same wall-clock minute counted once
// per stream. Either way the report ends up showing more webcam time than online time.
//
// Intervals still running keep stoppedOn === 0 so they continue to tick.
function normalizeUserWebcams(activitiesJson) {
  const newActivities = activitiesJson;

  Object.values(newActivities.users || {}).forEach((user) => {
    const newUser = user;
    if (!newUser.webcams?.length) return;

    const online = mergeIntervals(
      Object.values(newUser.intIds || {}).flatMap((intId) => (
        (intId.sessions || []).map((session) => [
          session.registeredOn,
          session.leftOn > 0 ? session.leftOn : OPEN,
        ])
      )),
    );

    if (online.length === 0) {
      newUser.webcams = [];
      return;
    }

    const webcams = mergeIntervals(
      newUser.webcams.map((webcam) => [
        webcam.startedOn,
        webcam.stoppedOn > 0 ? webcam.stoppedOn : OPEN,
      ]),
    );

    // Both sides are non-overlapping, so the intersections are already sorted
    // and disjoint — each wall-clock millisecond survives at most once.
    const clipped = [];
    webcams.forEach(([webcamStart, webcamEnd]) => {
      online.forEach(([onlineStart, onlineEnd]) => {
        const startedOn = Math.max(webcamStart, onlineStart);
        const stoppedOn = Math.min(webcamEnd, onlineEnd);
        if (stoppedOn > startedOn) {
          clipped.push({ startedOn, stoppedOn: stoppedOn === OPEN ? 0 : stoppedOn });
        }
      });
    });

    newUser.webcams = clipped;
  });

  return newActivities;
}

// When a meeting ends, the server closes every open session, webcam, screenshare and
// talk in the report and sets endedOn. If that final update is lost (e.g. the server
// dropped the meeting's state mid-session), the stored report keeps them open and they
// are counted until Date.now(), growing on every access.
//
// For reports known to be from finished meetings, end them at their last recorded
// activity instead, closing what was left open as the server would. Live reports must
// not go through this: endedOn is legitimately 0 while the meeting runs.
function closeUnfinishedReport(activitiesJson) {
  if (activitiesJson.endedOn > 0) return activitiesJson;

  const users = Object.values(activitiesJson.users || {});
  const sessions = users.flatMap((user) => Object.values(user.intIds || {})
    .flatMap((intId) => intId.sessions || []));
  const intervals = [
    ...(activitiesJson.screenshares || []),
    ...users.flatMap((user) => user.webcams || []),
  ];

  const endedOn = [
    activitiesJson.createdOn,
    ...(activitiesJson.presentationSlides || []).map(({ setOn }) => setOn),
    ...Object.values(activitiesJson.polls || {}).map(({ createdOn }) => createdOn),
    ...sessions.flatMap(({ registeredOn, leftOn }) => [registeredOn, leftOn]),
    ...[...intervals, ...users.flatMap((user) => user.away || [])]
      .flatMap(({ startedOn, stoppedOn }) => [startedOn, stoppedOn]),
    ...users.flatMap((user) => [
      ...(user.raiseHand || []),
      ...(user.reactions || []).map(({ sentOn }) => sentOn),
      user.talk?.lastTalkStartedOn,
      user.lastUserDisconnectionOn,
    ]),
  ].reduce((latest, ts) => (ts > latest ? ts : latest), 0);

  if (endedOn === 0) return activitiesJson;

  sessions.filter(({ leftOn }) => !leftOn)
    .forEach((session) => Object.assign(session, { leftOn: endedOn }));
  intervals.filter(({ stoppedOn }) => !stoppedOn)
    .forEach((interval) => Object.assign(interval, { stoppedOn: endedOn }));
  users.map(({ talk }) => talk).filter((talk) => talk?.lastTalkStartedOn > 0)
    .forEach((talk) => Object.assign(talk, {
      totalTime: talk.totalTime + (endedOn - talk.lastTalkStartedOn),
      lastTalkStartedOn: 0,
    }));

  return Object.assign(activitiesJson, { endedOn, endedOnEstimated: true });
}

// Session conversion runs first: the other passes read intId.sessions. Unfinished
// reports are closed before the webcam pass, so it clips against the closed sessions.
export default function normalizeActivitiesJson(
  activitiesJson,
  { isFinishedMeeting = false } = {},
) {
  const activities = convertUserSessionsFormat(activitiesJson);
  return normalizeUserWebcams(
    isFinishedMeeting ? closeUnfinishedReport(activities) : activities,
  );
}
