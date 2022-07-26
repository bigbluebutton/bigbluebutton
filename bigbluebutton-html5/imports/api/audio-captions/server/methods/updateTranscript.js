import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';

export default function updateTranscript(transcriptId, start, end, text, transcript, locale) {
  try {
    const REDIS_CONFIG = Meteor.settings.private.redis;
    const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
    const EVENT_NAME = 'UpdateTranscriptPubMsg';

    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);
    check(transcriptId, String);
    check(start, Number);
    check(end, Number);
    check(text, String);
    check(transcript, String);
    check(locale, String);

    // Ignore irrelevant updates
    if (start !== -1 && end !== -1) {
      const payload = {
        transcriptId,
        start,
        end,
        text,
        transcript,
        locale,
      };

      RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
    }
  } catch (err) {
    Logger.error(`Exception while invoking method upadteTranscript ${err.stack}`);
  }
}
