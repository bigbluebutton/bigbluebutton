import { check } from 'meteor/check';
import addPresentationPod from '../modifiers/addPresentationPod';

export default async function handleCreateNewPresentationPod({ body }, meetingId) {
  check(body, {
    currentPresenterId: String,
    podId: String,
  });
  check(meetingId, String);

  const { currentPresenterId, podId } = body;

  const pod = {
    currentPresenterId,
    podId,
  };

  await addPresentationPod(meetingId, pod);
}
