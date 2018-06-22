import RedisPubSub from '/imports/startup/server/redis';
import { check } from 'meteor/check';

export default function handleMeetingDestruction({ body }) {
  check(body, Object);
  const { meetingId } = body;
  check(meetingId, String);

  return RedisPubSub.destroyMeetingQueue(meetingId);
}
