import Redis from 'redis';
import { Meteor } from 'meteor/meteor';
import { EventEmitter2 } from 'eventemitter2';
import { check } from 'meteor/check';
import Logger from './logger';
import Metrics from './metrics';
import queue from 'queue';
import { PrometheusAgent, METRIC_NAMES } from './prom-metrics/index.js'

// Fake meetingId used for messages that have no meetingId
const NO_MEETING_ID = '_';

const { queueMetrics } = Meteor.settings.private.redis.metrics;
const { collectRedisMetrics: PROM_METRICS_ENABLED  } = Meteor.settings.private.prometheus;

const makeEnvelope = (channel, eventName, header, body, routing) => {
  const envelope = {
    envelope: {
      name: eventName,
      routing: routing || {
        sender: 'html5-server',
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

const getInstanceIdFromMessage = (parsedMessage) => {
  // End meeting message does not seem to have systemProps
  let instanceIdFromMessage = parsedMessage.core.body.props?.systemProps?.html5InstanceId;

  return instanceIdFromMessage;
};

class MeetingMessageQueue {
  constructor(eventEmitter, asyncMessages = [], redisDebugEnabled = false) {
    this.asyncMessages = asyncMessages;
    this.emitter = eventEmitter;
    this.queue = queue({ autostart: true, concurrency: 1 });
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

      const queueLength = this.queue.length;

      if (PROM_METRICS_ENABLED) {
        const dataLength = JSON.stringify(data).length;
        const currentTimestamp = Date.now();
        const processTime = currentTimestamp - beginHandleTimestamp;
        PrometheusAgent.observe(METRIC_NAMES.REDIS_PROCESSING_TIME, processTime, { eventName });
        PrometheusAgent.observe(METRIC_NAMES.REDIS_PAYLOAD_SIZE, dataLength, { eventName });
        meetingId && PrometheusAgent.set(METRIC_NAMES.REDIS_MESSAGE_QUEUE, queueLength, { meetingId });
      }

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
        if (!Meteor.settings.private.analytics.includeChat && eventName === 'GroupChatMessageBroadcastEvtMsg') {
          return;
        }
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
    const { taskHandler } = this.queue;

    this.queue.push(function (next) {
      taskHandler(...args, next);
    })

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
    this.instanceId = parseInt(process.env.INSTANCE_ID, 10) || 1; // 1 also handles running in dev mode
    this.role = process.env.BBB_HTML5_ROLE;
    this.customRedisChannel = `to-html5-redis-channel${this.instanceId}`;

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
    this.meetingsQueues = {};
    // We create this _ meeting queue because we need to be able to handle system messages (no meetingId in core.header)
    this.meetingsQueues[NO_MEETING_ID] = new MeetingMessageQueue(this.emitter, this.config.async, this.config.debug);

    this.handleSubscribe = this.handleSubscribe.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
  }

  init() {
    this.sub.on('psubscribe', Meteor.bindEnvironment(this.handleSubscribe));
    this.sub.on('pmessage', Meteor.bindEnvironment(this.handleMessage));

    const channelsToSubscribe = this.config.subscribeTo;

    channelsToSubscribe.push(this.customRedisChannel);

    switch (this.role) {
      case 'frontend':
        this.sub.psubscribe('from-akka-apps-frontend-redis-channel');
        if (this.redisDebugEnabled) {
          Logger.debug(`Redis: NodeJSPool:${this.instanceId} Role: frontend. Subscribed to 'from-akka-apps-frontend-redis-channel'`);
        }
        break;
      case 'backend':
        channelsToSubscribe.forEach((channel) => {
          this.sub.psubscribe(channel);
          if (this.redisDebugEnabled) {
            Logger.debug(`Redis: NodeJSPool:${this.instanceId} Role: backend. Subscribed to '${channelsToSubscribe}'`);
          }
        });
        break;
      default:
        this.sub.psubscribe('from-akka-apps-frontend-redis-channel');
        channelsToSubscribe.forEach((channel) => {
          this.sub.psubscribe(channel);
          if (this.redisDebugEnabled) {
            Logger.debug(`Redis: NodeJSPool:${this.instanceId} Role:${this.role} (likely only one nodejs running, doing both frontend and backend. Dev env? ). Subscribed to '${channelsToSubscribe}'`);
          }
        });

        break;
    }
  }

  updateConfig(config) {
    this.config = Object.assign({}, this.config, config);
    this.redisDebugEnabled = this.config.debug;
  }


  // TODO: Move this out of this class, maybe pass as a callback to init?
  handleSubscribe() {
    if (this.didSendRequestEvent || this.role === 'frontend') return;

    // populate collections with pre-existing data
    const REDIS_CONFIG = Meteor.settings.private.redis;
    const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
    const EVENT_NAME = 'GetAllMeetingsReqMsg';

    const body = {
      requesterId: 'nodeJSapp',
      html5InstanceId: this.instanceId,
    };

    this.publishSystemMessage(CHANNEL, EVENT_NAME, body);
    this.didSendRequestEvent = true;
  }

  handleMessage(pattern, channel, message) {
    const parsedMessage = JSON.parse(message);
    const { ignored: ignoredMessages, async } = this.config;
    const eventName = parsedMessage.core.header.name;

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

    if (this.redisDebugEnabled) {
      Logger.warn('Received event to handle', { date: new Date().toISOString(), eventName });
    }

    // System messages like Create / Destroy Meeting, etc do not have core.header.meetingId.
    // Process them in MeetingQueue['_']  --- the NO_MEETING queueId
    const meetingIdFromMessageCoreHeader = parsedMessage.core.header.meetingId || NO_MEETING_ID;

    if (this.role === 'frontend') {
      // receiving this message means we need to look at it. Frontends do not have instanceId.
      if (meetingIdFromMessageCoreHeader === NO_MEETING_ID) { // if this is a system message
        if (eventName === 'MeetingCreatedEvtMsg' || eventName === 'SyncGetMeetingInfoRespMsg') {
          const meetingIdFromMessageMeetingProp = parsedMessage.core.body.props.meetingProp.intId;
          this.meetingsQueues[meetingIdFromMessageMeetingProp] = new MeetingMessageQueue(this.emitter, async, this.redisDebugEnabled);
          if (this.redisDebugEnabled) {
            Logger.warn('Created frontend queue for meeting', { date: new Date().toISOString(), eventName, meetingIdFromMessageMeetingProp });
          }
        }
      }

      if (eventName === 'SendWhiteboardAnnotationsEvtMsg') {
        // we need the instanceId in the handler to avoid calling the same upsert on the
        // Annotations collection multiple times
        parsedMessage.core.body.myInstanceId = this.instanceId;
      }

      if (!this.meetingsQueues[meetingIdFromMessageCoreHeader]) {
        Logger.warn(`Frontend meeting queue had not been initialized   ${message}`, { eventName, meetingIdFromMessageCoreHeader });
        this.meetingsQueues[NO_MEETING_ID].add({
          pattern,
          channel,
          eventName,
          parsedMessage,
        });
      } else {
        // process the event - whether it's a system message or not, the meetingIdFromMessageCoreHeader value is adjusted
        this.meetingsQueues[meetingIdFromMessageCoreHeader].add({
          pattern,
          channel,
          eventName,
          parsedMessage,
        });
      }
    } else { // backend
      if (meetingIdFromMessageCoreHeader === NO_MEETING_ID) { // if this is a system message
        const meetingIdFromMessageMeetingProp = parsedMessage.core.body.props?.meetingProp?.intId;
        const instanceIdFromMessage = getInstanceIdFromMessage(parsedMessage);

        if (this.instanceId === instanceIdFromMessage) {
          // create queue or destroy queue
          if (eventName === 'MeetingCreatedEvtMsg' || eventName === 'SyncGetMeetingInfoRespMsg') {
            this.meetingsQueues[meetingIdFromMessageMeetingProp] = new MeetingMessageQueue(this.emitter, async, this.redisDebugEnabled);
            if (this.redisDebugEnabled) {
              Logger.warn('Created backend queue for meeting', { date: new Date().toISOString(), eventName, meetingIdFromMessageMeetingProp });
            }
          }
          this.meetingsQueues[NO_MEETING_ID].add({
            pattern,
            channel,
            eventName,
            parsedMessage,
          });
        } else {
          if (eventName === 'MeetingEndedEvtMsg' || eventName === 'MeetingDestroyedEvtMsg') {
            // MeetingEndedEvtMsg does not follow the system message pattern for meetingId
            // but we still need to process it on the backend which is processing the rest of the events
            // for this meetingId (it does not contain instanceId either, so we cannot compare that)
            const meetingIdForMeetingEnded = parsedMessage.core.body.meetingId;
            if (!!this.meetingsQueues[meetingIdForMeetingEnded]) {
              this.meetingsQueues[NO_MEETING_ID].add({
                pattern,
                channel,
                eventName,
                parsedMessage,
              });
            }
          }
          // ignore
        }
      } else {
        // add to existing queue
        if (!!this.meetingsQueues[meetingIdFromMessageCoreHeader]) {
          // only handle message if we have a queue for the meeting. If we don't have a queue, it means it's for a different instanceId
          this.meetingsQueues[meetingIdFromMessageCoreHeader].add({
            pattern,
            channel,
            eventName,
            parsedMessage,
          });
        } else {
          // If we reach this line, this means that there is no existing queue for this redis "backend" message
          // which means that the meeting is fully handled by another bbb-html5-backend.
          // Logger.warn('Backend meeting queue had not been initialized', { eventName, meetingIdFromMessageCoreHeader })
        }
      }
    }
  }

  destroyMeetingQueue(id) {
    delete this.meetingsQueues[id];
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
