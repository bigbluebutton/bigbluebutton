import { logger } from '/imports/startup/server/logger';
import { myQueue } from '/imports/startup/server';
import { indexOf, publish } from '/imports/api/common/server/helpers';

export class RedisPubSub {
  constructor() {
    const REDIS_CONFIG = Meteor.settings.redis;

    logger.info('constructor RedisPubSub');
    this.pubClient = redis.createClient();
    this.subClient = redis.createClient();
    logger.info(`Subscribing message on channel: ${REDIS_CONFIG.channels.fromBBBApps}`);
    this.subClient.on('psubscribe', Meteor.bindEnvironment(this._onSubscribe));
    this.subClient.on('pmessage', Meteor.bindEnvironment(this._addToQueue));
    this.subClient.psubscribe(REDIS_CONFIG.channels.fromBBBApps);
  }

  _onSubscribe(channel, count) {
    const REDIS_CONFIG = Meteor.settings.redis;

    let message;
    logger.info(`Subscribed to ${channel}`);

    //grab data about all active meetings on the server
    message = {
      header: {
        name: 'get_all_meetings_request',
      },
      payload: {}, // I need this, otherwise bbb-apps won't recognize the message
    };
    return publish(REDIS_CONFIG.channels.toBBBApps.meeting, message);
  }

  _addToQueue(pattern, channel, jsonMsg) {
    const message = JSON.parse(jsonMsg);
    const eventName = message.header.name;
    const messagesWeIgnore = [
      'BbbPubSubPongMessage',
      'bbb_apps_is_alive_message',
      'broadcast_layout_message',
    ];
    if (indexOf.call(messagesWeIgnore, eventName) < 0) {

      // For DEVELOPMENT purposes only
      // Dynamic shapes' updates will slow down significantly
      if (Meteor.settings.public.runtime.env == 'development') {
        logger.info(`Q ${eventName} ${myQueue.total()}`);
      }

      return myQueue.add({
        pattern: pattern,
        channel: channel,
        jsonMsg: jsonMsg,
      });
    }
  }

}
