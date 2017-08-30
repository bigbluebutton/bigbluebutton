/* global PowerQueue */
import Redis from 'redis';
import { Meteor } from 'meteor/meteor';
import { EventEmitter2 } from 'eventemitter2';
import { check } from 'meteor/check';
import Logger from './logger';

class RedisPubSub2x {
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

  publish(channel, eventName, meetingId, payload = {}, header = {}) {
    const header2x = {
      name: eventName,
      meetingId,
    };

    const msgHeader = header === {} ? header2x : header;

    const envelope = {
      envelope: {
        name: eventName,
        routing: {
          sender: 'bbb-apps-akka',
          // sender: 'html5-server', // TODO
        },
      },
      core: {
        header: msgHeader,
        body: payload,
      },
    };

    Logger.warn(`<<<<<<Publishing 2.0   ${eventName} to ${channel} ${JSON.stringify(envelope)}`);
    return this.pub.publish(channel, JSON.stringify(envelope), (err) => {
      if (err) {
        Logger.error('Tried to publish to %s', channel, envelope);
      }
    });
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

    const header = {
      name: EVENT_NAME,
    };

    // We need to send an empty string in the this.publish as third param,
    // the bbb does not support null or undefined meetingId.
    this.publish(CHANNEL, EVENT_NAME, '', body, header);
    this.didSendRequestEvent = true;
  }

  handleMessage(pattern, channel, message) {
    Logger.warn(`2.0 handleMessage: ${message}`);
    const REDIS_CONFIG = Meteor.settings.redis;
    const { fromAkkaApps, toHTML5 } = REDIS_CONFIG.channels;

    const parsedMessage = JSON.parse(message);
    const { header } = parsedMessage.core;
    const eventName = header.name;

    Logger.info(`2.0 QUEUE | PROGRESS ${this.queue.progress()}% | LENGTH ${this.queue.length()}} ${eventName} | CHANNEL ${channel}`);

    const regex = new RegExp(fromAkkaApps);
    // We should only handle messages from this two channels, else, we simple ignore them.
    if (!regex.test(channel) && channel !== toHTML5) {
      Logger.warn(`The following message was ignored: CHANNEL ${channel} MESSAGE ${message}`);
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
