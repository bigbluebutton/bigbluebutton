/**
 * @classdesc
 * Model class for rooms
 */

'use strict'

module.exports = class Room {
  constructor(id) {
    this._id = id;
    this._users = {};
    this._mcuUsers = {};
  }

  getUser (id) {
    return this._users[id];
  }

  setUser (user) {
  if (typeof this._users[user.id] == 'undefined' ||
        !this._users[user.id]) {
      this._users[user.id] = {};
    }
    this._users[user.id] = user;
  }

  destroyUser(userId) {
    this._users[userId] = null;;
  }
}
