import { check } from 'meteor/check';
import PresentationPods from '/imports/api/presentation-pods';
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

  try {
    const { numberAffected } = PresentationPods.upsert(selector, modifier);

    if (numberAffected) {
      Logger.info(`Set a new presenter in pod id=${podId} meeting=${meetingId} presenter=${nextPresenterId}`);
    }
  } catch (err) {
    Logger.error(`Error on setting a presenter in pod: ${err}`);
  }
}
