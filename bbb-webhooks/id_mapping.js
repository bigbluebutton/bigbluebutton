const _ = require("lodash");
const async = require("async");
const redis = require("redis");

const config = require('config');
const Logger = require("./logger.js");
const UserMapping = require("./userMapping.js");

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

// A simple model to store mappings for meeting IDs.
module.exports = class IDMapping {

  constructor() {
    this.id = null;
    this.externalMeetingID = null;
    this.internalMeetingID = null;
    this.lastActivity = null;
    this.redisClient = Application.redisClient();
  }

  save(callback) {
    this.redisClient.hmset(config.get("redis.keys.mappingPrefix") + ":" + this.id, this.toRedis(), (error, reply) => {
      if (error != null) { Logger.error("[IDMapping] error saving mapping to redis:", error, reply); }
      this.redisClient.sadd(config.get("redis.keys.mappings"), this.id, (error, reply) => {
        if (error != null) { Logger.error("[IDMapping] error saving mapping ID to the list of mappings:", error, reply); }

        db[this.internalMeetingID] = this;
        (typeof callback === 'function' ? callback(error, db[this.internalMeetingID]) : undefined);
      });
    });
  }

  destroy(callback) {
    this.redisClient.srem(config.get("redis.keys.mappings"), this.id, (error, reply) => {
      if (error != null) { Logger.error("[IDMapping] error removing mapping ID from the list of mappings:", error, reply); }
      this.redisClient.del(config.get("redis.keys.mappingPrefix") + ":" + this.id, error => {
        if (error != null) { Logger.error("[IDMapping] error removing mapping from redis:", error); }

        if (db[this.internalMeetingID]) {
          delete db[this.internalMeetingID];
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
      "internalMeetingID": this.internalMeetingID,
      "externalMeetingID": this.externalMeetingID,
      "lastActivity": this.lastActivity
    };
    return r;
  }

  fromRedis(redisData) {
    this.id = parseInt(redisData.id);
    this.externalMeetingID = redisData.externalMeetingID;
    this.internalMeetingID = redisData.internalMeetingID;
    this.lastActivity = redisData.lastActivity;
  }

  print() {
    return JSON.stringify(this.toRedis());
  }

  static addOrUpdateMapping(internalMeetingID, externalMeetingID, callback) {
    let mapping = new IDMapping();
    mapping.id = nextID++;
    mapping.internalMeetingID = internalMeetingID;
    mapping.externalMeetingID = externalMeetingID;
    mapping.lastActivity = new Date().getTime();
    mapping.save(function(error, result) {
      Logger.info(`[IDMapping] added or changed meeting mapping to the list ${externalMeetingID}:`, mapping.print());
      (typeof callback === 'function' ? callback(error, result) : undefined);
    });
  }

  static removeMapping(internalMeetingID, callback) {
    return (() => {
      let result = [];
      for (let internal in db) {
        var mapping = db[internal];
        if (mapping.internalMeetingID === internalMeetingID) {
          result.push(mapping.destroy( (error, result) => {
            Logger.info(`[IDMapping] removing meeting mapping from the list ${external}:`, mapping.print());
            return (typeof callback === 'function' ? callback(error, result) : undefined);
          }));
        } else {
          result.push(undefined);
        }
      }
      return result;
    })();
  }

  static getInternalMeetingID(externalMeetingID) {
    const mapping = IDMapping.findByExternalMeetingID(externalMeetingID);
    return (mapping != null ? mapping.internalMeetingID : undefined);
  }

  static getExternalMeetingID(internalMeetingID) {
    if (db[internalMeetingID]){
      return db[internalMeetingID].externalMeetingID;
    }
  }

  static findByExternalMeetingID(externalMeetingID) {
    if (externalMeetingID != null) {
      for (let internal in db) {
        const mapping = db[internal];
        if (mapping.externalMeetingID === externalMeetingID) {
          return mapping;
        }
      }
    }
    return null;
  }

  static allSync() {
    let arr = Object.keys(db).reduce(function(arr, id) {
      arr.push(db[id]);
      return arr;
    }
    , []);
    return arr;
  }

  // Sets the last activity of the mapping for `internalMeetingID` to now.
  static reportActivity(internalMeetingID) {
    let mapping = db[internalMeetingID];
    if (mapping != null) {
      mapping.lastActivity = new Date().getTime();
      return mapping.save();
    }
  }

  // Checks all current mappings for their last activity and removes the ones that
  // are "expired", that had their last activity too long ago.
  static cleanup() {
    const now = new Date().getTime();
    const all = IDMapping.allSync();
    const toRemove = _.filter(all, mapping => mapping.lastActivity < (now - config.get("mappings.timeout")));
    if (!_.isEmpty(toRemove)) {
      Logger.info("[IDMapping] expiring the mappings:", _.map(toRemove, map => map.print()));
      toRemove.forEach(mapping => {
        UserMapping.removeMappingMeetingId(mapping.internalMeetingID);
        mapping.destroy()
      });
    }
  }

  // Initializes global methods for this model.
  static initialize(callback) {
    IDMapping.resync(callback);
    IDMapping.cleanupInterval = setInterval(IDMapping.cleanup, config.get("mappings.cleanupInterval"));
  }

  // Gets all mappings from redis to populate the local database.
  // Calls `callback()` when done.
  static resync(callback) {
    let client = Application.redisClient();
    let tasks = [];

    return client.smembers(config.get("redis.keys.mappings"), (error, mappings) => {
      if (error != null) { Logger.error("[IDMapping] error getting list of mappings from redis:", error); }

      mappings.forEach(id => {
        tasks.push(done => {
          client.hgetall(config.get("redis.keys.mappingPrefix") + ":" + id, function(error, mappingData) {
            if (error != null) { Logger.error("[IDMapping] error getting information for a mapping from redis:", error); }

            if (mappingData != null) {
              let mapping = new IDMapping();
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
        mappings = _.map(IDMapping.allSync(), m => m.print());
        Logger.info("[IDMapping] finished resync, mappings registered:", mappings);
        return (typeof callback === 'function' ? callback() : undefined);
      });
    });
  }
};
