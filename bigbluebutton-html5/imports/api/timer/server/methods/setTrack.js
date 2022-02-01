import { check } from 'meteor/check';
import updateTimer from '/imports/api/timer/server/modifiers/updateTimer';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { isTrackValid } from '/imports/api/timer/server/helpers';

export default function setTrack(track) {
  const { meetingId, requesterUserId } = extractCredentials(this.userId);
  check(meetingId, String);
  check(track, String);

  //These are bogus values, won't update collection
  const time = 0;
  const stopwatch = false;
  const accumulated = 0;

  if (isTrackValid(track)) {
    updateTimer('track', meetingId, time, stopwatch, accumulated, track);
  } else {
    Logger.warn(`User=${requesterUserId} tried to set invalid track '${track}' in meeting=${meetingId}`);
  }
}
