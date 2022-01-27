import { check } from 'meteor/check';
import addScreenshare from '../modifiers/addScreenshare';
import clearScreenshare from '../modifiers/clearScreenshare';

export default function handleScreenshareSync({ body }, meetingId) {
  check(meetingId, String);
  check(body, Object);

  const { isBroadcasting, screenshareConf } = body;

  check(screenshareConf, String);
  check(isBroadcasting, Boolean);

  if (!isBroadcasting) {
    return clearScreenshare(meetingId, screenshareConf);
  }

  return addScreenshare(meetingId, body);
}
