import RedisPubSub from '/imports/startup/server/redis';
import { check } from 'meteor/check';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';
import setPresentationExporting from '/imports/api/presentations/server/modifiers/setPresentationExporting';
import Presentations from '/imports/api/presentations';

const EXPORTING_THRESHOLD_PER_SLIDE = 2500;

export default async function exportPresentation(presentationId, fileStateType) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'MakePresentationDownloadReqMsg';

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);
    check(presentationId, String);

    const payload = {
      presId: presentationId,
      allPages: true,
      fileStateType,
      pages: [],
    };

    const setObserver = async () => {
      let timeoutRef = null;

      const selector = { meetingId, id: presentationId };
      const cursor = Presentations.find(selector);
      const pres = await Presentations.findOneAsync(selector);
      const numPages = pres?.pages?.length ?? 1;
      const threshold = EXPORTING_THRESHOLD_PER_SLIDE * numPages;

      const observer = cursor.observe({
        changed: (doc) => {
          const { status } = doc.exportation;

          if (status === 'EXPORTED') {
            Meteor.clearTimeout(timeoutRef);
          }
        },
      });

      timeoutRef = Meteor.setTimeout(async () => {
        observer.stop();
        await setPresentationExporting(meetingId, presentationId, { status: 'TIMEOUT' });
      }, threshold);
    };

    await setPresentationExporting(meetingId, presentationId, { status: 'RUNNING' });
    await setObserver();

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method exportPresentation ${err.stack}`);
  }
}
