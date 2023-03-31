import PresentationPods from '/imports/api/presentation-pods';
import Logger from '/imports/startup/server/logger';
import clearPresentations from '/imports/api/presentations/server/modifiers/clearPresentations';
import clearPresentationUploadToken from '/imports/api/presentation-upload-token/server/modifiers/clearPresentationUploadToken';

export default async function clearPresentationPods(meetingId) {
  if (meetingId) {
    try {
      const numberAffected = await PresentationPods.removeAsync({ meetingId });

      if (numberAffected) {
        await clearPresentations(meetingId);
        await clearPresentationUploadToken(meetingId);
        Logger.info(`Cleared Presentations Pods (${meetingId})`);
      }
    } catch (err) {
      Logger.error(`Error on clearing Presentations Pods (${meetingId}). ${err}`);
    }
  } else {
    try {
      const numberAffected = await PresentationPods.removeAsync({});

      if (numberAffected) {
        await clearPresentations();
        await clearPresentationUploadToken();
        Logger.info('Cleared Presentations Pods (all)');
      }
    } catch (err) {
      Logger.error(`Error on clearing Presentations Pods (all). ${err}`);
    }
  }
}
