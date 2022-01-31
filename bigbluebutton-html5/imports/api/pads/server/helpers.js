import RedisPubSub from '/imports/startup/server/redis';
import { Meteor } from 'meteor/meteor';
import Logger from '/imports/startup/server/logger';

const NOTES_CONFIG = Meteor.settings.public.notes;
const CAPTIONS_CONFIG = Meteor.settings.public.captions;
const REDIS_CONFIG = Meteor.settings.private.redis;
const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
const TOKEN = '$';

const models = {
  CAPTIONS: CAPTIONS_CONFIG.id,
  NOTES: NOTES_CONFIG.id,
};

const getDataFromChangeset = (changeset) => {
  const splitChangeset = changeset.split(TOKEN);
  if (splitChangeset.length > 1) {
    splitChangeset.shift();

    return splitChangeset.join(TOKEN);
  }

  return '';
};

const createGroup = (meetingId, externalId, model, name) => {
  const EVENT_NAME = 'PadCreateGroupReqMsg';

  try {
    const payload = {
      externalId,
      model,
      name,
    };

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, 'nodeJSapp', payload);
  } catch (err) {
    Logger.error(`Exception while invoking method createGroup ${err.stack}`);
  }
};

const initPads = (meetingId) => {
  if (NOTES_CONFIG.enabled) createGroup(meetingId, NOTES_CONFIG.id, models.NOTES, NOTES_CONFIG.id);
};

export {
  getDataFromChangeset,
  initPads,
  models,
};
