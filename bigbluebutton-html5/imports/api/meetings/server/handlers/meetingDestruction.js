import RedisPubSub from '/imports/startup/server/redis2x';
import { check } from 'meteor/check';

export default function handleMeetingDestruction(_, meetingId) {
  check(meetingId, String);

  return RedisPubSub.destroyMeetingQueue(meetingId);
}
