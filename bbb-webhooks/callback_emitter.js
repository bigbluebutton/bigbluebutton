"use strict";
let CallbackEmitter;
const _ = require('lodash');
const request = require("request");
const url = require('url');
const EventEmitter = require('events').EventEmitter;

const config = require("./config.js");
const Logger = require("./logger.js");
const Utils = require("./utils.js");

// Use to perform a callback. Will try several times until the callback is
// properly emitted and stop when successful (or after a given number of tries).
// Used to emit a single callback. Destroy it and create a new class for a new callback.
// Emits "success" on success, "failure" on error and "stopped" when gave up trying
// to perform the callback.
module.exports = (CallbackEmitter = class CallbackEmitter extends EventEmitter {

  constructor(callbackURL, message, backupURL) {
    super();
    this.callbackURL = callbackURL;
    this.message = message;
    this.backupURL = backupURL;
    this.nextInterval = 0;
    this.timestap = 0;
    this.permanent = false;
  }

  start(permanent) {
    this.timestamp = new Date().getTime();
    this.nextInterval = 0;
    this.permanent = permanent;
    this._scheduleNext(0);
  }

  _scheduleNext(timeout) {
    setTimeout( () => {
      this._emitMessage((error, result) => {
        if ((error == null) && result) {
          this.emit("success");
        } else {
          this.emit("failure", error);

          // get the next interval we have to wait and schedule a new try
          const interval = config.hooks.retryIntervals[this.nextInterval];
          if (interval != null) {
            Logger.warn(`[Emitter] trying the callback again in ${interval/1000.0} secs`);
            this.nextInterval++;
            this._scheduleNext(interval);

          // no intervals anymore, time to give up
          } else {
            this.nextInterval = !this.permanent ? 0 : 8; // Reset interval to permanent hooks
            // If a hook has backup URLs for the POSTS, use them after a few failed attempts
            if ((this.backupURL != null) && this.permanent) { this.backupURL.push(this.backupURL[0]); this.backupURL.shift(); this.callbackURL = this.backupURL[0]; }
            if (this.permanent) { this._scheduleNext(interval); }
            if (!this.permanent) { return this.emit("stopped"); }
          }
        }
      });
    }

    , timeout);
  }

  _emitMessage(callback) {
    // data to be sent
    // note: keep keys in alphabetical order
    const data = {
      event: this.message,
      timestamp: this.timestamp
    };

    // calculate the checksum
    const checksum = Utils.checksum(`${this.callbackURL}${JSON.stringify(data)}${config.bbb.sharedSecret}`);

    // get the final callback URL, including the checksum
    const urlObj = url.parse(this.callbackURL, true);
    let callbackURL = this.callbackURL;
    callbackURL += _.isEmpty(urlObj.search) ? "?" : "&";
    callbackURL += `checksum=${checksum}`;

    const requestOptions = {
      followRedirect: true,
      maxRedirects: 10,
      uri: callbackURL,
      method: "POST",
      form: data
    };

    request(requestOptions, function(error, response, body) {
      if ((error != null) || !(((response != null ? response.statusCode : undefined) >= 200) && ((response != null ? response.statusCode : undefined) < 300))) {
        Logger.warn(`[Emitter] error in the callback call to: [${requestOptions.uri}] for ${simplifiedEvent(data.event)}`, "error:", error, "status:", response != null ? response.statusCode : undefined);
        callback(error, false);
      } else {
        Logger.info(`[Emitter] successful callback call to: [${requestOptions.uri}] for ${simplifiedEvent(data.event)}`);
        callback(null, true);
      }
    });
  }
});

// A simple string that identifies the event
var simplifiedEvent = function(event) {
  try {
    const eventJs = JSON.parse(event);
    return `event: { name: ${(eventJs.data != null ? eventJs.data.id : undefined)}, timestamp: ${(eventJs.data.event != null ? eventJs.data.event.ts : undefined)} }`;
  } catch (e) {
    return `event: ${event}`;
  }
};
