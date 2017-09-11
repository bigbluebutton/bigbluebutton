"use strict";
let Hook;
const _ = require("lodash");
const async = require("async");
const redis = require("redis");

const config = require("./config.js");
const CallbackEmitter = require("./callback_emitter.js");
const IDMapping = require("./id_mapping.js");
const Logger = require("./logger.js");

// The database of hooks.
// Used always from memory, but saved to redis for persistence.
//
// Format:
//   { id: Hook }
// Format on redis:
//   * a SET "...:hooks" with all ids
//   * a HASH "...:hook:<id>" for each hook with some of its attributes
let db = {};
let nextID = 1;

// The representation of a hook and its properties. Stored in memory and persisted
// to redis.
// Hooks can be global, receiving callback calls for events from all meetings on the
// server, or for a specific meeting. If an `externalMeetingID` is set in the hook,
// it will only receive calls related to this meeting, otherwise it will be global.
// Events are kept in a queue to be sent in the order they are received.
// But if the requests are going by but taking too long, the queue might be increasing
// faster than the callbacks are made. In this case the events will be concatenated
// and send up to 10 events in every post

module.exports = (Hook = class Hook {

  constructor() {
    this.id = null;
    this.callbackURL = null;
    this.externalMeetingID = null;
    this.queue = [];
    this.emitter = null;
    this.redisClient = redis.createClient();
    this.permanent = false;
    this.backupURL = [];
    this.getRaw = false;
  }

  save(callback) {
   this.redisClient.hmset(config.redis.keys.hook(this.id), this.toRedis(), (error, reply) => {
      if (error != null) { Logger.error("[Hook] error saving hook to redis:", error, reply); }
     this.redisClient.sadd(config.redis.keys.hooks, this.id, (error, reply) => {
        if (error != null) { Logger.error("[Hook] error saving hookID to the list of hooks:", error, reply); }

        db[this.id] = this;
       (typeof callback === 'function' ? callback(error, db[this.id]) : undefined);
      });
    });
  }

  destroy(callback) {
   this.redisClient.srem(config.redis.keys.hooks, this.id, (error, reply) => {
      if (error != null) { Logger.error("[Hook] error removing hookID from the list of hooks:", error, reply); }
     this.redisClient.del(config.redis.keys.hook(this.id), error => {
        if (error != null) { Logger.error("[Hook] error removing hook from redis:", error); }

        if (db[this.id]) {
          delete db[this.id];
         (typeof callback === 'function' ? callback(error, true) : undefined);
        } else {
         (typeof callback === 'function' ? callback(error, false) : undefined);
        }
      });
    });
  }

  // Is this a global hook?
  isGlobal() {
    return (this.externalMeetingID == null);
  }

  // The meeting from which this hook should receive events.
  targetMeetingID() {
    return this.externalMeetingID;
  }

  // Puts a new message in the queue. Will also trigger a processing in the queue so this
  // message might be processed instantly.
  enqueue(message) {
    this.redisClient.llen(config.redis.keys.events(this.id), (error, reply) => {
      const length = reply;
      if (length < config.hooks.queueSize) {
        Logger.info(`[Hook] ${this.callbackURL} enqueueing message:`, JSON.stringify(message));
        // Add message to redis queue
        this.redisClient.rpush(config.redis.keys.events(this.id), JSON.stringify(message), (error,reply) => {});
        if (error != null) { Logger.error("[Hook] error pushing event to redis queue:", JSON.stringify(message), error); }
        this.queue.push(JSON.stringify(message));
        this._processQueue();
      } else {
        Logger.warn("[Hook] queue size exceed, event:", JSON.stringify(message));
      }
    });
  }

  toRedis() {
    const r = {
      "hookID": this.id,
      "callbackURL": this.callbackURL,
      "permanent": this.permanent,
      "backupURL": this.backupURL,
      "getRaw": this.getRaw
    };
    if (this.externalMeetingID != null) { r.externalMeetingID = this.externalMeetingID; }
    return r;
  }

  fromRedis(redisData) {
    this.id = parseInt(redisData.hookID);
    this.callbackURL = redisData.callbackURL;
    this.permanent = redisData.permanent;
    this.backupURL = redisData.backupURL;
    this.getRaw = redisData.getRaw;
    if (redisData.externalMeetingID != null) {
      this.externalMeetingID = redisData.externalMeetingID;
    } else {
      this.externalMeetingID = null;
    }
  }

  // Gets the first message in the queue and start an emitter to send it. Will only do it
  // if there is no emitter running already and if there is a message in the queue.
  _processQueue() {
    // Will try to send up to 10 messages together if they're enqueued
    const lengthIn = this.queue.length > 10 ? 10 : this.queue.length;
    let num = lengthIn + 1;
    // Concat messages
    let message = this.queue.slice(0,lengthIn);
    message = message.join(",");

    if ((message == null) || (this.emitter != null) || (lengthIn <= 0)) { return; }
    // Add params so emitter will 'know' when a hook is permanent and have backupURLs
    this.emitter = new CallbackEmitter(this.callbackURL, message, this.backupURL);
    this.emitter.start(this.permanent);

    this.emitter.on("success", () => {
      delete this.emitter;
      while ((num -= 1)) {
        // Remove the sent message from redis
        this.redisClient.lpop(config.redis.keys.events(this.id), (error, reply) => {
          if (error != null) { return Logger.error("[Hook] error removing event from redis queue:", error); }
        });
        this.queue.shift();
      }  // pop the first message just sent
      this._processQueue(); // go to the next message
    });

    // gave up trying to perform the callback, remove the hook forever if the hook's not permanent (emmiter will validate that)
    return this.emitter.on("stopped", error => {
      Logger.warn("[Hook] too many failed attempts to perform a callback call, removing the hook for:", this.callbackURL);
      this.destroy();
    });
  }

  static addSubscription(callbackURL, meetingID, getRaw, callback) {
    //Since we can pass a list of URLs to serve as backup for the permanent hook, we need to check that
    const firstURL = callbackURL instanceof Array ? callbackURL[0] : callbackURL;

    let hook = Hook.findByCallbackURLSync(firstURL);
    if (hook != null) {
      return (typeof callback === 'function' ? callback(new Error("There is already a subscription for this callback URL"), hook) : undefined);
    } else {
      let msg = `[Hook] adding a hook with callback URL: [${firstURL}],`;
      if (meetingID != null) { msg += ` for the meeting: [${meetingID}]`; }
      Logger.info(msg);

      hook = new Hook();
      hook.callbackURL = firstURL;
      hook.externalMeetingID = meetingID;
      hook.getRaw = getRaw;
      hook.permanent = config.hooks.aggr.some( url => {
        return url === firstURL
      });
      if (hook.permanent) { hook.id = 1;nextID++; } else { hook.id = nextID++; }
      // Create backup URLs list
      let backupURLs = callbackURL instanceof Array ? callbackURL : [];
      backupURLs.push(firstURL); backupURLs.shift();
      hook.backupURL = backupURLs;
      Logger.info("[Hook] Backup URLs:", hook.backupURL);
      // Sync permanent queue
      if (hook.permanent) {
        hook.redisClient.llen(config.redis.keys.events(hook.id), (error, len) => {
          if (len > 0) {
            const length = len;
            hook.redisClient.lrange(config.redis.keys.events(hook.id), 0, len, (error, elements) => {
              elements.forEach(element => {
                hook.queue.push(element);
              });
              if (hook.queue.length > 0) { return hook._processQueue(); }
            });
          }
        });
      }
      hook.save((error, hook) => typeof callback === 'function' ? callback(error, hook) : undefined);
    }
  }

  static removeSubscription(hookID, callback) {
    let hook = Hook.getSync(hookID);
    if (((hook != null) && (hook.permanent === "false")) || (hook.permanent === false)) {
      let msg = `[Hook] removing the hook with callback URL: [${hook.callbackURL}],`;
      if (hook.externalMeetingID != null) { msg += ` for the meeting: [${hook.externalMeetingID}]`; }
      Logger.info(msg);

      hook.destroy((error, removed) => typeof callback === 'function' ? callback(error, removed) : undefined);
    } else {
      return (typeof callback === 'function' ? callback(null, false) : undefined);
    }
  }

  static countSync() {
    return Object.keys(db).length;
  }

  static getSync(id) {
    return db[id];
  }

  static firstSync() {
    const keys = Object.keys(db);
    if (keys.length > 0) {
      return db[keys[0]];
    } else {
      return null;
    }
  }

  static findByExternalMeetingIDSync(externalMeetingID) {
    const hooks = Hook.allSync();
    return _.filter(hooks, hook => (externalMeetingID != null) && (externalMeetingID === hook.externalMeetingID));
  }

  static allGlobalSync() {
    const hooks = Hook.allSync();
    return _.filter(hooks, hook => hook.isGlobal());
  }

  static allSync() {
    let arr = Object.keys(db).reduce(function(arr, id) {
      arr.push(db[id]);
      return arr;
    }
    , []);
    return arr;
  }

  static clearSync() {
    for (let id in db) {
      delete db[id];
    }
    return db = {};
  }

  static findByCallbackURLSync(callbackURL) {
    for (let id in db) {
      if (db[id].callbackURL === callbackURL) {
        return db[id];
      }
    }
  }

  static initialize(callback) {
    Hook.resync(callback);
  }

  // Gets all hooks from redis to populate the local database.
  // Calls `callback()` when done.
  static resync(callback) {
    let client = redis.createClient();
    // Remove previous permanent hook (always ID = 1)
    client.srem(config.redis.keys.hooks, 1, (error, reply) => {
      if (error != null) { Logger.error("[Hook] error removing previous permanent hook from list:", error); }
      client.del(config.redis.keys.hook(1), error => {
        if (error != null) { Logger.error("[Hook] error removing previous permanent hook from redis:", error); }
      });
    });

    let tasks = [];

    client.smembers(config.redis.keys.hooks, (error, hooks) => {
      if (error != null) { Logger.error("[Hook] error getting list of hooks from redis:", error); }
      hooks.forEach(id => {
        tasks.push(done => {
          client.hgetall(config.redis.keys.hook(id), function(error, hookData) {
            if (error != null) { Logger.error("[Hook] error getting information for a hook from redis:", error); }

            if (hookData != null) {
              let length;
              let hook = new Hook();
              hook.fromRedis(hookData);
              // sync events queue
              client.llen(config.redis.keys.events(hook.id), (error, len) => {
                length = len;
                client.lrange(config.redis.keys.events(hook.id), 0, len, (error, elements) => {
                  elements.forEach(element => {
                    hook.queue.push(element);
                  });
                });
              });
              // Persist hook to redis
              hook.save( (error, hook) => {
                if (hook.id >= nextID) { nextID = hook.id + 1; }
                if (hook.queue.length > 0) { hook._processQueue(); }
                done(null, hook);
              });
            } else {
              done(null, null);
            }
          });
        });
      });

      async.series(tasks, function(errors, result) {
        hooks = _.map(Hook.allSync(), hook => `[${hook.id}] ${hook.callbackURL}`);
        Logger.info("[Hook] finished resync, hooks registered:", hooks);
        (typeof callback === 'function' ? callback() : undefined);
      });
    });
  }
});
