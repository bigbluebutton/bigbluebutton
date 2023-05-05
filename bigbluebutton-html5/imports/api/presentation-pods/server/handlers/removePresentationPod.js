import { check } from 'meteor/check';
import removePresentationPod from '../modifiers/removePresentationPod';

export default function handleRemovePresentationPod({ body }, meetingId) {
  check(body, Object);
  check(meetingId, String);

  const { podId } = body;

  check(podId, String);

  removePresentationPod(meetingId, podId);
}
