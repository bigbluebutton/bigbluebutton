import RedisPubSub from '/imports/startup/server/redis';
import Captions from '/imports/api/captions';
import Logger from '/imports/startup/server/logger';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export default function addPad(padId, readOnlyId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'AddPadSysMsg';

  try {
    check(padId, String);
    check(readOnlyId, String);

    const pad = Captions.findOne({ padId });

    if (!pad) {
      Logger.error(`Could not find closed captions pad ${padId}`);
      return;
    }

    const { meetingId } = pad;

    check(meetingId, String);

    const payload = {
      padId,
      readOnlyId,
    };

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, 'nodeJSapp', payload);
  } catch (err) {
    Logger.error(`Exception while invoking method addPad ${err.stack}`);
  }
}
