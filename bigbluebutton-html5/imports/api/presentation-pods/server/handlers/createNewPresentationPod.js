import { check } from 'meteor/check';
import addPresentationPod from '../modifiers/addPresentationPod';

export default function handleCreateNewPresentationPod({ body }, meetingId) {
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

  addPresentationPod(meetingId, pod);
}
