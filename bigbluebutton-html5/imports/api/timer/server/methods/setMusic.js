import { check } from 'meteor/check';
import updateTimer from '/imports/api/timer/server/modifiers/updateTimer';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function setMusic(music) {
  const { meetingId } = extractCredentials(this.userId);
  check(meetingId, String);

  //These are bogus values, won't update collection
  const time = 0;
  const stopwatch = false;
  const accumulated = 0;

  updateTimer('music', meetingId, time, stopwatch, accumulated, music);
}
