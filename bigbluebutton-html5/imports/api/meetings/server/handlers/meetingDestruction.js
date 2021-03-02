import RedisPubSub from '/imports/startup/server/redis';
import { check } from 'meteor/check';

import { removeAnnotationsStreamer } from '/imports/api/annotations/server/streamer';
import { removeCursorStreamer } from '/imports/api/cursor/server/streamer';
import { removeExternalVideoStreamer } from '/imports/api/external-videos/server/streamer';

export default function handleMeetingDestruction({ body }) {
  check(body, Object);
  const { meetingId } = body;
  check(meetingId, String);

  if (!process.env.BBB_HTML5_ROLE || process.env.BBB_HTML5_ROLE === 'frontend') {
    removeAnnotationsStreamer(meetingId);
    removeCursorStreamer(meetingId);
    removeExternalVideoStreamer(meetingId);
  }

  return RedisPubSub.destroyMeetingQueue(meetingId);
}
