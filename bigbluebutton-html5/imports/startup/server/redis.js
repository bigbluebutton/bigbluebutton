/* global PowerQueue */
import Redis from 'redis';
import { Meteor } from 'meteor/meteor';
import { EventEmitter2 } from 'eventemitter2';
import { check } from 'meteor/check';
import fs from 'fs';
import Logger from './logger';
import Metrics from './metrics';

// Fake meetingId used for messages that have no meetingId
const NO_MEETING_ID = '_';

const { queueMetrics } = Meteor.settings.private.redis.metrics;

const makeEnvelope = (channel, eventName, header, body, routing) => {
  const envelope = {
    envelope: {
      name: eventName,
      routing: routing || {
        sender: 'bbb-apps-akka',
        // sender: 'html5-server', // TODO
      },
      timestamp: Date.now(),
    },
    core: {
      header,
      body,
    },
  };

  return JSON.stringify(envelope);
};

class MeetingMessageQueue {
  constructor(eventEmitter, asyncMessages = [], redisDebugEnabled = false) {
    this.asyncMessages = asyncMessages;
    this.emitter = eventEmitter;
    this.queue = new PowerQueue();
    this.redisDebugEnabled = redisDebugEnabled;

    this.handleTask = this.handleTask.bind(this);
    this.queue.taskHandler = this.handleTask;
  }

  handleTask(data, next) {
    const { channel } = data;
    const { envelope } = data.parsedMessage;
    const { header } = data.parsedMessage.core;
    const { body } = data.parsedMessage.core;
    const { meetingId } = header;
    const eventName = header.name;
    const isAsync = this.asyncMessages.includes(channel)
      || this.asyncMessages.includes(eventName);

    const beginHandleTimestamp = Date.now();
    let called = false;

    check(eventName, String);
    check(body, Object);

    const callNext = () => {
      if (called) return;
      if (this.redisDebugEnabled) {
        Logger.debug(`Redis: ${eventName} completed ${isAsync ? 'async' : 'sync'}`);
      }
      called = true;

      if (queueMetrics) {
        const queueId = meetingId || NO_MEETING_ID;
        const dataLength = JSON.stringify(data).length;

        Metrics.processEvent(queueId, eventName, dataLength, beginHandleTimestamp);
      }

      const queueLength = this.queue.length();
      if (queueLength > 100) {
        Logger.warn(`Redis: MeetingMessageQueue for meetingId=${meetingId} has queue size=${queueLength} `);
      }
      next();
    };

    const onError = (reason) => {
      Logger.error(`${eventName}: ${reason.stack ? reason.stack : reason}`);
      callNext();
    };

    try {
      if (this.redisDebugEnabled) {
        Logger.debug(`Redis: ${JSON.stringify(data.parsedMessage.core)} emitted`);
      }

      if (isAsync) {
        callNext();
      }

      this.emitter
        .emitAsync(eventName, { envelope, header, body }, meetingId)
        .then(callNext)
        .catch(onError);
    } catch (reason) {
      onError(reason);
    }
  }

  add(...args) {
    return this.queue.add(...args);
  }
}

class RedisPubSub {
  static handlePublishError(err) {
    if (err) {
      Logger.error(err);
    }
  }

  constructor(config = {}) {
    this.config = config;

    this.didSendRequestEvent = false;
    const host = process.env.REDIS_HOST || Meteor.settings.private.redis.host;
    const redisConf = Meteor.settings.private.redis;
    const { password, port } = redisConf;

    if (password) {
      this.pub = Redis.createClient({ host, port, password });
      this.sub = Redis.createClient({ host, port, password });
      this.pub.auth(password);
      this.sub.auth(password);
    } else {
      this.pub = Redis.createClient({ host, port });
      this.sub = Redis.createClient({ host, port });
    }

    if (queueMetrics) {
      Metrics.startDumpFile();
    }

    this.emitter = new EventEmitter2();
    this.mettingsQueues = {};

    this.handleSubscribe = this.handleSubscribe.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
  }

  init() {
    this.sub.on('psubscribe', Meteor.bindEnvironment(this.handleSubscribe));
    this.sub.on('pmessage', Meteor.bindEnvironment(this.handleMessage));

    const channelsToSubscribe = this.config.subscribeTo;

    channelsToSubscribe.forEach((channel) => {
      this.sub.psubscribe(channel);
    });

    if (this.redisDebugEnabled) {
      Logger.debug(`Redis: Subscribed to '${channelsToSubscribe}'`);
    }
  }

  updateConfig(config) {
    this.config = Object.assign({}, this.config, config);
    this.redisDebugEnabled = this.config.debug;
  }


  // TODO: Move this out of this class, maybe pass as a callback to init?
  handleSubscribe() {
    if (this.didSendRequestEvent) return;

    // populate collections with pre-existing data
    const REDIS_CONFIG = Meteor.settings.private.redis;
    const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
    const EVENT_NAME = 'GetAllMeetingsReqMsg';

    const body = {
      requesterId: 'nodeJSapp',
    };

    this.publishSystemMessage(CHANNEL, EVENT_NAME, body);
    this.didSendRequestEvent = true;
  }

  handleMessage(pattern, channel, message) {
    const parsedMessage = JSON.parse(message);
    const { name: eventName, meetingId } = parsedMessage.core.header;
    const { ignored: ignoredMessages, async } = this.config;

    if (ignoredMessages.includes(channel)
      || ignoredMessages.includes(eventName)) {
      if (eventName === 'CheckAlivePongSysMsg') {
        return;
      }
      if (this.redisDebugEnabled) {
        Logger.debug(`Redis: ${eventName} skipped`);
      }
      return;
    }

    const queueId = meetingId || NO_MEETING_ID;

    if (queueMetrics) {
      Metrics.addEvent(queueId, eventName, message.length);
    }

    if (!(queueId in this.mettingsQueues)) {
      this.mettingsQueues[meetingId] = new MeetingMessageQueue(this.emitter, async, this.redisDebugEnabled);
    }

    this.mettingsQueues[meetingId].add({
      pattern,
      channel,
      eventName,
      parsedMessage,
    });
  }

  destroyMeetingQueue(id) {
    delete this.mettingsQueues[id];
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

    return this.pub.publish(channel, envelope, RedisPubSub.handlePublishError);
  }

  publishSystemMessage(channel, eventName, payload) {
    const header = {
      name: eventName,
    };

    const envelope = makeEnvelope(channel, eventName, header, payload);

    return this.pub.publish(channel, envelope, RedisPubSub.handlePublishError);
  }

  publishMeetingMessage(channel, eventName, meetingId, payload) {
    const header = {
      name: eventName,
      meetingId,
    };

    const envelope = makeEnvelope(channel, eventName, header, payload);

    return this.pub.publish(channel, envelope, RedisPubSub.handlePublishError);
  }

  publishUserMessage(channel, eventName, meetingId, userId, payload) {
    const header = {
      name: eventName,
      meetingId,
      userId,
    };

    if (!meetingId || !userId) {
      Logger.warn(`Publishing ${eventName} with potentially missing data userId=${userId} meetingId=${meetingId}`);
    }
    const envelope = makeEnvelope(channel, eventName, header, payload, { meetingId, userId });

    return this.pub.publish(channel, envelope, RedisPubSub.handlePublishError);
  }
}

const RedisPubSubSingleton = new RedisPubSub();

Meteor.startup(() => {
  const REDIS_CONFIG = Meteor.settings.private.redis;

  RedisPubSubSingleton.updateConfig(REDIS_CONFIG);
  RedisPubSubSingleton.init();
});

export default RedisPubSubSingleton;
