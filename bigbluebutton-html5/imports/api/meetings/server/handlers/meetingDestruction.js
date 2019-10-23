import RedisPubSub from '/imports/startup/server/redis';
import { check } from 'meteor/check';

import destroyExternalVideo from '/imports/api/external-videos/server/methods/destroyExternalVideo';

export default function handleMeetingDestruction({ body }) {
  check(body, Object);
  const { meetingId } = body;
  check(meetingId, String);

  destroyExternalVideo(meetingId);

  return RedisPubSub.destroyMeetingQueue(meetingId);
}
