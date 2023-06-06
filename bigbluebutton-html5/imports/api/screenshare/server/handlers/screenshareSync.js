import { check } from 'meteor/check';
import addScreenshare from '../modifiers/addScreenshare';
import clearScreenshare from '../modifiers/clearScreenshare';

export default async function handleScreenshareSync({ body }, meetingId) {
  check(meetingId, String);
  check(body, Object);

  const { isBroadcasting, screenshareConf } = body;

  check(screenshareConf, String);
  check(isBroadcasting, Boolean);

  if (!isBroadcasting) {
    const result = await clearScreenshare(meetingId, screenshareConf);
    return result;
  }
  const result = await addScreenshare(meetingId, body);
  return result;
}
