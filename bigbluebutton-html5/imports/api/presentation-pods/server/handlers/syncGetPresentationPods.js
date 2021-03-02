import { check } from 'meteor/check';
import PresentationPods from '/imports/api/presentation-pods';
import removePresentationPod from '../modifiers/removePresentationPod';
import addPresentationPod from '../modifiers/addPresentationPod';

export default function handleSyncGetPresentationPods({ body }, meetingId) {
  check(body, Object);
  check(meetingId, String);

  const { pods } = body;
  check(pods, Array);

  const presentationPodIds = pods.map(pod => pod.id);

  const presentationPodsToRemove = PresentationPods.find({
    meetingId,
    podId: { $nin: presentationPodIds },
  }, { fields: { podId: 1 } }).fetch();

  presentationPodsToRemove.forEach(p => removePresentationPod(meetingId, p.podId));

  pods.forEach((pod) => {
    // 'podId' and 'currentPresenterId' for some reason called 'id' and 'currentPresenter'
    // in this message
    const {
      id: podId,
      currentPresenter: currentPresenterId,
      presentations,
    } = pod;
    addPresentationPod(meetingId, { podId, currentPresenterId }, presentations);
  });
}
