/**
 * @classdesc
 * Model class for rooms
 */

'use strict'

const C = require('../constants/Constants');

module.exports = class Room {
  constructor(id, emitter) {
    this._id = id;
    this._users = {};
    this._mcuUsers = {};
    this.emitter = emitter;
  }

  getUser (id) {
    return this._users[id];
  }

  setUser (user) {
    this._users[user.id] = user;
  }

  destroyUser(userId) {
    if (this._users[userId]) {
      delete this._users[userId];
      if (Object.keys(this._users).length <= 0) {
        this.emitter.emit(C.EVENT.ROOM_EMPTY, this._id);
      }
    }
  }
}
