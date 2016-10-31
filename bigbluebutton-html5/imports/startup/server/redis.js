import Redis from 'redis';
import Logger from './logger';
import { Meteor } from 'meteor/meteor';
import { EventEmitter2 } from 'eventemitter2';

const REQUEST_EVENT = 'get_all_meetings_request';

class RedisPubSub {
  constructor(config = {}) {
    this.config = config;

    this.pub = Redis.createClient();
    this.sub = Redis.createClient();
    this.emitter = new EventEmitter2();
    this.queue = new PowerQueue();

    this.handleTask = this.handleTask.bind(this);
    this.handleSubscribe = this.handleSubscribe.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
  }

  init(config = {}) {
    this.queue.taskHandler = this.handleTask;
    this.sub.on('psubscribe', Meteor.bindEnvironment(this.handleSubscribe));
    this.sub.on('pmessage', Meteor.bindEnvironment(this.handleMessage));

    this.queue.reset();
    this.sub.psubscribe(this.config.channels.fromBBBApps);
    this.sub.psubscribe(this.config.channels.toBBBApps.html5);

    Logger.info(`Subscribed to '${this.config.channels.fromBBBApps}'`);
  }

  updateConfig(config) {
    this.config = Object.assign({}, this.config, config);
  }

  on(event, listener) {
    return this.emitter.on(...arguments);
  }

  publish(channel, eventName, payload = {}, header = {}) {
    let message = {
      header: Object.assign({
        timestamp: new Date().getTime(),
        name: eventName,
      }, header),
      payload: payload,
    };

    this._debug(`Publishing ${eventName} to ${channel}`);
    return this.pub.publish(channel, JSON.stringify(message), (err, res) => {
      if (err) {
        Logger.error(`Tried to publish to %s`, channel, message);
      }
    });
  }

  handleSubscribe() {
    this.publish(this.config.channels.toBBBApps.meeting, REQUEST_EVENT);
  }

  handleMessage(pattern, channel, message = '') {
    try {
      message = JSON.parse(message);
    } catch (e) {}

    const eventName = message.header.name;
    const messagesWeIgnore = this.config.ignoredMessages || [];

    if (!messagesWeIgnore.includes(eventName)) {
      this._debug(`${eventName} added to queue`);

      //Logger.info(`QUEUE | PROGRESS ${this.queue.progress()}% | LENGTH ${this.queue.length()}}`);

      return this.queue.add({
        pattern: pattern,
        channel: channel,
        eventName: eventName,
        message: message,
      });
    }
  }

  handleTask(data, next, failures) {
    const { eventName, message } = data;

    try {
      message.callback = () => {}; // legacy noop function

      this._debug(`${eventName} emitted`);
      return this.emitter
        .emitAsync(eventName, message)
        .then(_ => {
          this._debug(`${eventName} completed`);
          return next();
        })
        .catch(reason => {
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
};

let RedisPubSubSingleton = new RedisPubSub();

Meteor.startup(() => {
  const REDIS_CONFIG = Meteor.settings.redis;

  RedisPubSubSingleton.updateConfig(REDIS_CONFIG);
  RedisPubSubSingleton.init();
});

export default RedisPubSubSingleton;
