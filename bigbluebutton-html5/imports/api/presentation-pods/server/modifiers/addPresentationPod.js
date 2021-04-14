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

  try {
    const { insertedId } = PresentationPods.upsert(selector, modifier);

    // if it's a Sync message - continue adding the attached presentations
    if (presentations) {
      presentations.forEach(presentation => addPresentation(meetingId, podId, presentation));
    }

    if (insertedId) {
      Logger.info(`Added presentation pod id=${podId} meeting=${meetingId}`);
    } else {
      Logger.info(`Upserted presentation pod id=${podId} meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Adding presentation pod to the collection: ${err}`);
  }
}
