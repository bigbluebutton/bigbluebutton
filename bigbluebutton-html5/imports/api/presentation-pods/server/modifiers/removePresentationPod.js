import { check } from 'meteor/check';
import PresentationPods from '/imports/api/presentations';
import Logger from '/imports/startup/server/logger';
import clearPresentations from '/imports/api/presentations/server/modifiers/clearPresentations';

export default function removePresentationPod(meetingId, podId) {
  check(meetingId, String);
  check(podId, String);

  const selector = {
    meetingId,
    podId,
  };

  const cb = (err) => {
    if (err) {
      Logger.error(`Removing presentation pod from collection: ${err}`);
      return;
    }

    if (podId) {
      Logger.info(`Removed presentation pod id=${podId} meeting=${meetingId}`);
      clearPresentations(meetingId, podId);
    }
  };

  return PresentationPods.remove(selector, cb);
}
