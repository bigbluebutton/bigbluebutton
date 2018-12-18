import { check } from 'meteor/check';
import clearScreenshare from '../modifiers/clearScreenshare';

export default function handleScreenshareStopped({ body }, meetingId) {
  const { screenshareConf } = body;

  check(meetingId, String);
  check(screenshareConf, String);

  return clearScreenshare(meetingId, screenshareConf);
}
