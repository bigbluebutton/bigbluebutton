import { check } from 'meteor/check';
import PresentationPods from '/imports/api/presentation-pods';
import Logger from '/imports/startup/server/logger';
import clearPresentations from '/imports/api/presentations/server/modifiers/clearPresentations';
import clearPresentationUploadToken from '/imports/api/presentation-upload-token/server/modifiers/clearPresentationUploadToken';

export default function removePresentationPod(meetingId, podId) {
  check(meetingId, String);
  check(podId, String);

  const selector = {
    meetingId,
    podId,
  };

  try {
    const numberAffected = PresentationPods.remove(selector);

    if (numberAffected && podId) {
      Logger.info(`Removed presentation pod id=${podId} meeting=${meetingId}`);
      clearPresentations(meetingId, podId);
      clearPresentationUploadToken(meetingId, podId);
    }
  } catch (err) {
    Logger.error(`Error on removing presentation pod from collection: ${err}`);
  }
}
