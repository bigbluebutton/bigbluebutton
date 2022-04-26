import Logger from '/imports/startup/server/logger';
import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';
import setCurrentSlide from '../modifiers/setCurrentSlide';

export default function changeCurrentSlide(slideNum) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'BroadcastLayoutMsg';


  console.log('$$$$$$$$$$$$$$$$$$$')
  console.log(slideNum)
  console.log('$$$$$$$$$$$$$$$$$$$')

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);
    setCurrentSlide(meetingId, slideNum);
    // check(meetingId, String);
    // check(requesterUserId, String);

    // const payload = {
    //   layout,
    // };

    // RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (err) {
    // Logger.error(`Exception while invoking method changeLayout ${err.stack}`);
  }
}
