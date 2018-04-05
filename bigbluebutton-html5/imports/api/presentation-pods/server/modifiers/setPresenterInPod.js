import { check } from 'meteor/check';
import PresentationPods from '/imports/api/presentations';
import Logger from '/imports/startup/server/logger';

export default function setPresenterInPod(meetingId, podId, nextPresenterId) {
  check(meetingId, String);
  check(podId, String);
  check(nextPresenterId, String);

  const selector = {
    meetingId,
    podId,
  };

  const modifier = {
    $set: {
      currentPresenterId: nextPresenterId,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      Logger.error(`Setting a presenter in pod: ${err}`);
      return;
    }

    if (numChanged) {
      Logger.info(`Set a new presenter in pod id=${podId} meeting=${meetingId}`);
    }
  };

  return PresentationPods.upsert(selector, modifier, cb);
}
