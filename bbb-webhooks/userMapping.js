const _ = require("lodash");
const async = require("async");
const redis = require("redis");

const config = require("config");
const Logger = require("./logger.js");

// The database of mappings. Uses the internal ID as key because it is unique
// unlike the external ID.
// Used always from memory, but saved to redis for persistence.
//
// Format:
//   {
//      internalMeetingID: {
//       id: @id
//       externalMeetingID: @externalMeetingID
//       internalMeetingID: @internalMeetingID
//       lastActivity: @lastActivity
//     }
//   }
// Format on redis:
//   * a SET "...:mappings" with all ids (not meeting ids, the object id)
//   * a HASH "...:mapping:<id>" for each mapping with all its attributes
const db = {};
let nextID = 1;

// A simple model to store mappings for user extIDs.
module.exports = class UserMapping {

  constructor() {
    this.id = null;
    this.externalUserID = null;
    this.internalUserID = null;
    this.meetingId = null;
    this.user = null;
    this.redisClient = Application.redisClient();
  }

  save(callback) {
    db[this.internalUserID] = this;

    this.redisClient.hmset(config.get("redis.keys.userMapPrefix") + ":" + this.id, this.toRedis(), (error, reply) => {
      if (error != null) { Logger.error("[UserMapping] error saving mapping to redis:", error, reply); }
      this.redisClient.sadd(config.get("redis.keys.userMaps"), this.id, (error, reply) => {
        if (error != null) { Logger.error("[UserMapping] error saving mapping ID to the list of mappings:", error, reply); }

        (typeof callback === 'function' ? callback(error, db[this.internalUserID]) : undefined);
      });
    });
  }

  destroy(callback) {
    this.redisClient.srem(config.get("redis.keys.userMaps"), this.id, (error, reply) => {
      if (error != null) { Logger.error("[UserMapping] error removing mapping ID from the list of mappings:", error, reply); }
      this.redisClient.del(config.get("redis.keys.userMapPrefix") + ":" + this.id, error => {
        if (error != null) { Logger.error("[UserMapping] error removing mapping from redis:", error); }

        if (db[this.internalUserID]) {
          delete db[this.internalUserID];
          (typeof callback === 'function' ? callback(error, true) : undefined);
        } else {
          (typeof callback === 'function' ? callback(error, false) : undefined);
        }
      });
    });
  }

  toRedis() {
    const r = {
      "id": this.id,
      "internalUserID": this.internalUserID,
      "externalUserID": this.externalUserID,
      "meetingId": this.meetingId,
      "user": this.user
    };
    return r;
  }

  fromRedis(redisData) {
    this.id = parseInt(redisData.id);
    this.externalUserID = redisData.externalUserID;
    this.internalUserID = redisData.internalUserID;
    this.meetingId = redisData.meetingId;
    this.user = redisData.user;
  }

  print() {
    return JSON.stringify(this.toRedis());
  }

  static addOrUpdateMapping(internalUserID, externalUserID, meetingId, user, callback) {
    let mapping = new UserMapping();
    mapping.id = nextID++;
    mapping.internalUserID = internalUserID;
    mapping.externalUserID = externalUserID;
    mapping.meetingId = meetingId;
    mapping.user = user;
    mapping.save(function(error, result) {
      Logger.info(`[UserMapping] added user mapping to the list ${internalUserID}:`, mapping.print());
      (typeof callback === 'function' ? callback(error, result) : undefined);
    });
  }

  static removeMapping(internalUserID, callback) {
    return (() => {
      let result = [];
      for (let internal in db) {
        var mapping = db[internal];
        if (mapping.internalUserID === internalUserID) {
          result.push(mapping.destroy( (error, result) => {
            Logger.info(`[UserMapping] removing user mapping from the list ${internalUserID}:`, mapping.print());
            return (typeof callback === 'function' ? callback(error, result) : undefined);
          }));
        } else {
          result.push(undefined);
        }
      }
      return result;
    })();
  }

  static removeMappingMeetingId(meetingId, callback) {
    return (() => {
      let result = [];
      for (let internal in db) {
        var mapping = db[internal];
        if (mapping.meetingId === meetingId) {
          result.push(mapping.destroy( (error, result) => {
            Logger.info(`[UserMapping] removing user mapping from the list ${mapping.internalUserID}:`, mapping.print());
          }));
        } else {
          result.push(undefined);
        }
      }
      return (typeof callback === 'function' ? callback() : undefined);
    })();
  }

  static getUser(internalUserID) {
    if (db[internalUserID]){
      return db[internalUserID].user;
    }
  }

  static getExternalUserID(internalUserID) {
    if (db[internalUserID]){
      return db[internalUserID].externalUserID;
    }
  }

  static allSync() {
    let arr = Object.keys(db).reduce(function(arr, id) {
      arr.push(db[id]);
      return arr;
    }
    , []);
    return arr;
  }

  // Initializes global methods for this model.
  static initialize(callback) {
    UserMapping.resync(callback);
  }

  // Gets all mappings from redis to populate the local database.
  // Calls `callback()` when done.
  static resync(callback) {
    let client = Application.redisClient();
    let tasks = [];

    return client.smembers(config.get("redis.keys.userMaps"), (error, mappings) => {
      if (error != null) { Logger.error("[UserMapping] error getting list of mappings from redis:", error); }

      mappings.forEach(id => {
        tasks.push(done => {
          client.hgetall(config.get("redis.keys.userMapPrefix") + ":" + id, function(error, mappingData) {
            if (error != null) { Logger.error("[UserMapping] error getting information for a mapping from redis:", error); }

            if (mappingData != null) {
              let mapping = new UserMapping();
              mapping.fromRedis(mappingData);
              mapping.save(function(error, hook) {
                if (mapping.id >= nextID) { nextID = mapping.id + 1; }
                done(null, mapping);
              });
            } else {
              done(null, null);
            }
          });
        });
      });

      return async.series(tasks, function(errors, result) {
        mappings = _.map(UserMapping.allSync(), m => m.print());
        Logger.info("[UserMapping] finished resync, mappings registered:", mappings);
        return (typeof callback === 'function' ? callback() : undefined);
      });
    });
  }
};
