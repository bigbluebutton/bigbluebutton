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

  getMcuUser (id) {
    return this._mcuUsers[id];
  }

  setUser (user) {
  if (typeof this._users[user.id] == 'undefined' ||
        !this._users[user.id]) {
      this._users[user.id] = {};
    }
    this._users[user.id] = user;
  }

  destroyUser(user) {
    let _user = this._users[user.id];
    _user.destroy();
    delete this._users[user.id];
  }

  destroyMcuUser (user) {
    let _user  = this._mcuUsers[user.id];
    _user.destroy();
    delete this._mcuUsers[user.id];
  }

}
