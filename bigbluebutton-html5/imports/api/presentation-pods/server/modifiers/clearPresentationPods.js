import PresentationPods from '/imports/api/presentation-pods';
import Logger from '/imports/startup/server/logger';
import clearPresentations from '/imports/api/presentations/server/modifiers/clearPresentations';
import clearPresentationUploadToken from '/imports/api/presentation-upload-token/server/modifiers/clearPresentationUploadToken';

export default function clearPresentationPods(meetingId) {
  if (meetingId) {
    try {
      const numberAffected = PresentationPods.remove({ meetingId });

      if (numberAffected) {
        clearPresentations(meetingId);
        clearPresentationUploadToken(meetingId);
        Logger.info(`Cleared Presentations Pods (${meetingId})`);
      }
    } catch (err) {
      Logger.error(`Error on clearing Presentations Pods (${meetingId}). ${err}`);
    }
  } else {
    try {
      const numberAffected = PresentationPods.remove({});

      if (numberAffected) {
        clearPresentations();
        clearPresentationUploadToken();
        Logger.info('Cleared Presentations Pods (all)');
      }
    } catch (err) {
      Logger.error(`Error on clearing Presentations Pods (all). ${err}`);
    }
  }
}
