import RedisPubSub from '/imports/startup/server/redis';
import { check } from 'meteor/check';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';
import setPresentationExporting from '/imports/api/presentations/server/modifiers/setPresentationExporting';
import Presentations from '/imports/api/presentations';

const EXPORTING_THRESHOLD_PER_SLIDE = 2500;

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

      const selector = { meetingId, id: presentationId };
      const cursor = Presentations.find(selector);
      const numPages = cursor.fetch()[0]?.pages?.length ?? 1;
      const threshold = EXPORTING_THRESHOLD_PER_SLIDE * numPages;

      const observer = cursor.observe({
        changed: (doc) => {
          const { status } = doc.exportation;

          if (status === 'EXPORTED') {
            Meteor.clearTimeout(timeoutRef);
          }
        },
      });

      timeoutRef = Meteor.setTimeout(() => {
        observer.stop();
        setPresentationExporting(meetingId, presentationId, { status: 'TIMEOUT' });
      }, threshold);
    };

    setPresentationExporting(meetingId, presentationId, { status: 'RUNNING' });
    setObserver();

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method exportPresentationToChat ${err.stack}`);
  }
}
