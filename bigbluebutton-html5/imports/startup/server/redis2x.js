/* global PowerQueue */
import Redis from 'redis';
import { Meteor } from 'meteor/meteor';
import { EventEmitter2 } from 'eventemitter2';
import { check } from 'meteor/check';
import Logger from './logger';

const makeEnvelope = (channel, eventName, header, body) => {
  const envelope = {
    envelope: {
      name: eventName,
      routing: {
        sender: 'bbb-apps-akka',
        // sender: 'html5-server', // TODO
      },
    },
    core: {
      header,
      body,
    },
  };

  return JSON.stringify(envelope);
};

class RedisPubSub2x {

  static handlePublishError(err) {
    if (err) {
      Logger.error(err);
    }
  }

  constructor(config = {}) {
    this.config = config;

    this.didSendRequestEvent = false;
    this.pub = Redis.createClient();
    this.sub = Redis.createClient();
    this.emitter = new EventEmitter2();
    this.queue = new PowerQueue();

    this.handleTask = this.handleTask.bind(this);
    this.handleSubscribe = this.handleSubscribe.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
  }

  init() {
    this.queue.taskHandler = this.handleTask;
    this.sub.on('psubscribe', Meteor.bindEnvironment(this.handleSubscribe));
    this.sub.on('pmessage', Meteor.bindEnvironment(this.handleMessage));

    this.queue.reset();
    this.sub.psubscribe(this.config.channels.fromAkkaApps); // 2.0
    this.sub.psubscribe(this.config.channels.toHTML5); // 2.0

    Logger.info(`Subscribed to '${this.config.channels.fromAkkaApps}'`);
  }

  updateConfig(config) {
    this.config = Object.assign({}, this.config, config);
  }

  on(...args) {
    return this.emitter.on(...args);
  }

  publishVoiceMessage(channel, eventName, voiceConf, payload) {
    const header = {
      name: eventName,
      voiceConf,
    };

    const envelope = makeEnvelope(channel, eventName, header, payload);

    return this.pub.publish(channel, envelope, RedisPubSub2x.handlePublishError);
  }

  publishSystemMessage(channel, eventName, payload) {
    const header = {
      name: eventName,
    };

    const envelope = makeEnvelope(channel, eventName, header, payload);

    return this.pub.publish(channel, envelope, RedisPubSub2x.handlePublishError);
  }

  publishMeetingMessage(channel, eventName, meetingId, payload) {
    const header = {
      name: eventName,
      meetingId,
    };

    const envelope = makeEnvelope(channel, eventName, header, payload);

    return this.pub.publish(channel, envelope, RedisPubSub2x.handlePublishError);
  }

  publishUserMessage(channel, eventName, meetingId, userId, payload) {
    const header = {
      name: eventName,
      meetingId,
      userId,
    };

    const envelope = makeEnvelope(channel, eventName, header, payload);

    return this.pub.publish(channel, envelope, RedisPubSub2x.handlePublishError);
  }

  handleSubscribe() {
    if (this.didSendRequestEvent) return;

      // populate collections with pre-existing data
    const REDIS_CONFIG = Meteor.settings.redis;
    const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
    const EVENT_NAME = 'GetAllMeetingsReqMsg';

    const body = {
      requesterId: 'nodeJSapp',
    };

    this.publishSystemMessage(CHANNEL, EVENT_NAME, body);
    this.didSendRequestEvent = true;
  }

  handleMessage(pattern, channel, message) {
    Logger.info(`2.0 handleMessage: ${message}`);
    const REDIS_CONFIG = Meteor.settings.redis;
    const { fromAkkaApps, toHTML5 } = REDIS_CONFIG.channels;

    const parsedMessage = JSON.parse(message);
    const { header } = parsedMessage.core;
    const eventName = header.name;

    Logger.info(`2.0 QUEUE | PROGRESS ${this.queue.progress()}% | LENGTH ${this.queue.length()}} ${eventName} | CHANNEL ${channel}`);

    const regex = new RegExp(fromAkkaApps);
    // We should only handle messages from this two channels, else, we simple ignore them.
    if (!regex.test(channel) && channel !== toHTML5) {
      Logger.info(`The following message was ignored: CHANNEL ${channel} MESSAGE ${message}`);
      return;
    }
    this.queue.add({
      pattern,
      channel,
      eventName,
      parsedMessage,
    });
  }

  handleTask(data, next) {
    const { header } = data.parsedMessage.core;
    const { body } = data.parsedMessage.core;
    const { envelope } = data.parsedMessage;
    const eventName = header.name;
    const meetingId = header.meetingId;

    check(eventName, String);
    check(body, Object);

    try {
      this._debug(`${eventName} emitted`);
      return this.emitter
        .emitAsync(eventName, { envelope, header, body }, meetingId)
        .then(() => {
          this._debug(`${eventName} completed`);
          return next();
        })
        .catch((reason) => {
          this._debug(`${eventName} completed with error`);
          Logger.error(`${eventName}: ${reason}`);
          return next();
        });
    } catch (reason) {
      this._debug(`${eventName} completed with error`);
      Logger.error(`${eventName}: ${reason}`);
      return next();
    }
  }

  _debug(message) {
    if (this.config.debug) {
      Logger.info(message);
    }
  }
}

const RedisPubSubSingleton = new RedisPubSub2x();

Meteor.startup(() => {
  const REDIS_CONFIG = Meteor.settings.redis;

  RedisPubSubSingleton.updateConfig(REDIS_CONFIG);
  RedisPubSubSingleton.init();
});

export default RedisPubSubSingleton;
