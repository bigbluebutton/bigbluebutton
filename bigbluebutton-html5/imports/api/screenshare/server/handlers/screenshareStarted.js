import { check } from 'meteor/check';
import addScreenshare from '../modifiers/addScreenshare';
import Logger from '/imports/startup/server/logger';

export default function handleScreenshareStarted({ body }, meetingId) {
  check(meetingId, String);
  check(body, Object);

  return addScreenshare(meetingId, body);
}
