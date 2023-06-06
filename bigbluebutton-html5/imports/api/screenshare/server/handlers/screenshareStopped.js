import { check } from 'meteor/check';
import clearScreenshare from '../modifiers/clearScreenshare';

export default async function handleScreenshareStopped({ body }, meetingId) {
  const { screenshareConf } = body;

  check(meetingId, String);
  check(screenshareConf, String);
  const result = await clearScreenshare(meetingId, screenshareConf);
  return result;
}
