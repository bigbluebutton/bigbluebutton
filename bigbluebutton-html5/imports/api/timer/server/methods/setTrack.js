import { check } from 'meteor/check';
import updateTimer from '/imports/api/timer/server/modifiers/updateTimer';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { isTrackValid } from '/imports/api/timer/server/helpers';

export default function setTrack(track) {
  const { meetingId, requesterUserId } = extractCredentials(this.userId);
  check(meetingId, String);
  check(requesterUserId, String);
  check(track, String);

  if (isTrackValid(track)) {
    updateTimer({
      action: 'track',
      meetingId,
      requesterUserId,
      stopwatch: false,
      track,
    });
  } else {
    Logger.warn(`User=${requesterUserId} tried to set invalid track '${track}' in meeting=${meetingId}`);
  }
}
