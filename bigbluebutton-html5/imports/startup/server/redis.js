/* global PowerQueue */
import Redis from 'redis';
import { Meteor } from 'meteor/meteor';
import { EventEmitter2 } from 'eventemitter2';
import { check } from 'meteor/check';
import Logger from './logger';

import addAnnotations from '/imports/api/annotations/server/modifiers/addAnnotation';
import Annotations from '/imports/api/annotations';

// Fake meetingId used for messages that have no meetingId
const NO_MEETING_ID = '_';

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

const makeDebugger = enabled => (message) => {
  if (!enabled) return;
  Logger.info(`REDIS: ${message}`);
};

class MettingMessageQueue {
  constructor(eventEmitter, asyncMessages = [], debug = () => {}) {
    this.asyncMessages = asyncMessages;
    this.emitter = eventEmitter;
    this.queue = new PowerQueue();
    this.debug = debug;

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

    let called = false;

    check(eventName, String);
    check(body, Object);

    const callNext = () => {
      if (called) return;
      this.debug(`${eventName} completed ${isAsync ? 'async' : 'sync'}`);
      called = true;
      const queueLength = this.queue.length();
      if (queueLength > 0) {
        Logger.error(`prev queue size=${queueLength} `);
      }
      next();
    };

    const onError = (reason) => {
      this.debug(`${eventName}: ${reason.stack ? reason.stack : reason}`);
      callNext();
    };

    try {
      this.debug(`${JSON.stringify(data.parsedMessage.core)} emitted`);

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
    this.pub = Redis.createClient();
    this.sub = Redis.createClient();
    this.emitter = new EventEmitter2();
    this.mettingsQueues = {};

    this.handleSubscribe = this.handleSubscribe.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.debug = makeDebugger(this.config.debug);

    this.annotationsBulk = [];
    this.lastBulkTime = null;
  }

  init() {
    this.sub.on('psubscribe', Meteor.bindEnvironment(this.handleSubscribe));
    this.sub.on('pmessage', Meteor.bindEnvironment(this.handleMessage));

    const channelsToSubscribe = this.config.subscribeTo;

    channelsToSubscribe.forEach((channel) => {
      this.sub.psubscribe(channel);
    });

    this.debug(`Subscribed to '${channelsToSubscribe}'`);

    let _this = this;
    setInterval(Meteor.bindEnvironment(function() {
      if(_this.annotationsBulk && _this.annotationsBulk.length > 0) {
        Annotations.rawCollection().bulkWrite(_this.annotationsBulk, function(error) { console.log(error); });
        _this.emptyAnnotationsBulk();
      }
    }), 100);
  }

  updateConfig(config) {
    this.config = Object.assign({}, this.config, config);
    this.debug = makeDebugger(this.config.debug);
  }

  addToAnnotationsBulk(annotation) {
    this.annotationsBulk.push(annotation);
  }

  addOperationsToBulk(operations) {
    this.annotationsBulk.push.apply(this.annotationsBulk, operations);
  }

  getAnnotationsBulk() {
    return this.annotationsBulk;
  }

  setLastBulkTime(time) {
    this.lastBulkTime = time;
  }

  getLastBulkTime() {
    return this.lastBulkTime;
  }

  emptyAnnotationsBulk() {
    this.annotationsBulk = [];
  }

  findAnnotationInsideBulk(selector) {
    let b = this.annotationsBulk;
    for(let i = b.length - 1; i >= 0; i--) {
      if(b[i].updateOne &&
        b[i].updateOne.update &&
        !(b[i].updateOne.update.$set) &&
        b[i].updateOne.filter &&
        b[i].updateOne.filter.id === selector.id &&
        b[i].updateOne.filter.userId === selector.userId &&
        b[i].updateOne.filter.meetingId === selector.meetingId &&
        b[i].updateOne.filter.whiteboardId === selector.whiteboardId) {
        return b[i].updateOne.update;
      }
    }
    return undefined;
  }

  findChunkInsideBulk(selector) {
    let b = this.annotationsBulk;
    for(let i = b.length - 1; i >= 0; i--) {
      if(b[i].updateOne &&
        b[i].updateOne.filter &&
        b[i].updateOne.filter.id === selector.id &&
        b[i].updateOne.filter.userId === selector.userId &&
        b[i].updateOne.filter.meetingId === selector.meetingId) {
        return b[i].updateOne.update;
      }
    }
    return undefined;
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
      this.debug(`${eventName} skipped`);
      return;
    }

    const queueId = meetingId || NO_MEETING_ID;

    if (!(queueId in this.mettingsQueues)) {
      this.mettingsQueues[meetingId] = new MettingMessageQueue(this.emitter, async, this.debug);
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

    const envelope = makeEnvelope(channel, eventName, header, payload);

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
