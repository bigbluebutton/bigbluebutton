import { Match, check } from 'meteor/check';
import PresentationPods from '/imports/api/presentation-pods';
import Logger from '/imports/startup/server/logger';
import addPresentation from '/imports/api/presentations/server/modifiers/addPresentation';

// 'presentations' is passed down here when we receive a Sync message
// and it's not used when we just create a new presentation pod
export default function addPresentationPod(meetingId, pod, presentations = undefined) {
  check(meetingId, String);
  check(presentations, Match.Maybe(Array));
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

    // if it's a Sync message - continue adding the attached presentations
    if (presentations) {
      presentations.forEach(presentation => addPresentation(meetingId, podId, presentation));
    }

    if (numChanged) {
      return Logger.info(`Added presentation pod id=${podId} meeting=${meetingId}`);
    }

    return Logger.info(`Upserted presentation pod id=${podId} meeting=${meetingId}`);
  };

  return PresentationPods.upsert(selector, modifier, cb);
}
