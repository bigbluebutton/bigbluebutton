import RedisPubSub from '/imports/startup/server/redis';
import { check } from 'meteor/check';

import destroyExternalVideo from '/imports/api/external-videos/server/methods/destroyExternalVideo';
import { removeAnnotationsStreamer } from '/imports/api/annotations/server/streamer';
import { removeCursorStreamer } from '/imports/api/cursor/server/streamer';

export default function handleMeetingDestruction({ body }) {
  check(body, Object);
  const { meetingId } = body;
  check(meetingId, String);

  destroyExternalVideo(meetingId);
  removeAnnotationsStreamer(meetingId);
  removeCursorStreamer(meetingId);

  return RedisPubSub.destroyMeetingQueue(meetingId);
}
