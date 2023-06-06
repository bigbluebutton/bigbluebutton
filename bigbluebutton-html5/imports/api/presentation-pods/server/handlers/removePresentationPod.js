import { check } from 'meteor/check';
import removePresentationPod from '../modifiers/removePresentationPod';

export default async function handleRemovePresentationPod({ body }, meetingId) {
  check(body, Object);
  check(meetingId, String);

  const { podId } = body;

  check(podId, String);

  await removePresentationPod(meetingId, podId);
}
