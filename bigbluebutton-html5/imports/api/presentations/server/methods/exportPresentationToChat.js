import RedisPubSub from '/imports/startup/server/redis';
import { check } from 'meteor/check';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';
import setPresentationExporting from '/imports/api/presentations/server/modifiers/setPresentationExporting';
import Presentations from '/imports/api/presentations';

const EXPORTING_THRESHOLD = 20000;

export default function exportPresentationToChat(presentationId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'MakePresentationWithAnnotationDownloadReqMsg';

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);
    check(presentationId, String);

    const payload = {
      presId: presentationId,
      allPages: true,
      pages: [],
    };

    const setObserver = () => {
      let timeoutRef = null;

      const cursor = Presentations.find({ id: presentationId });

      const observer = cursor.observe({
        changed: (doc) => {
          const { isRunning, error } = doc.exportation;

          if (!isRunning && !error) {
            clearTimeout(timeoutRef);
          }
        },
      });

      timeoutRef = setTimeout(() => {
        observer.stop();
        setPresentationExporting(meetingId, presentationId, { isRunning: false, error: true });
      }, EXPORTING_THRESHOLD);
    };

    setPresentationExporting(meetingId, presentationId, { isRunning: true, error: false });
    setObserver();

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method exportPresentationToChat ${err.stack}`);
  }
}
