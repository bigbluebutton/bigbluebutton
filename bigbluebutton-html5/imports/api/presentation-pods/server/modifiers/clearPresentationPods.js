import PresentationPods from '/imports/api/presentation-pods';
import Logger from '/imports/startup/server/logger';
import clearPresentations from '/imports/api/presentations/server/modifiers/clearPresentations';
import clearPresentationUploadToken from '/imports/api/presentation-upload-token/server/modifiers/clearPresentationUploadToken';

export default function clearPresentationPods(meetingId) {
  if (meetingId) {
    return PresentationPods.remove(
      { meetingId },
      () => {
        clearPresentations(meetingId);
        clearPresentationUploadToken(meetingId);
        Logger.info(`Cleared Presentations Pods (${meetingId})`);
      },
    );
  }

  return PresentationPods.remove({}, () => {
    clearPresentations();
    clearPresentationUploadToken();
    Logger.info('Cleared Presentations Pods (all)');
  });
}
