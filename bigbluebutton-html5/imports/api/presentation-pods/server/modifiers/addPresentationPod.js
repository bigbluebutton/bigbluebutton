import { Match, check } from 'meteor/check';
import PresentationPods from '/imports/api/presentation-pods';
import Logger from '/imports/startup/server/logger';

export default function addPresentationPod(meetingId, pod, presentation = null /* ?? */) {
  check(meetingId, String);
  check(presentation, Match.Maybe(Object));
  check(pod, {
    currentPresenterId: String,
    podId: String,
  });

  const { currentPresenterId, podId } = pod;

  const selector = {
    meetingId,
    podId,
  };

  const modifier = {
    meetingId,
    podId,
    currentPresenterId,
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding presentation pod to the collection: ${err}`);
    }

    if (numChanged) {
      return Logger.info(`Added presentation pod id=${podId} meeting=${meetingId}`);
    }

    return Logger.info(`Upserted presentation pod id=${podId} meeting=${meetingId}`);
  };

  return PresentationPods.upsert(selector, modifier, cb);
}
