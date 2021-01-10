const _ = require('lodash');
const request = require("request");
const url = require('url');
const EventEmitter = require('events').EventEmitter;

const config = require('config');
const Logger = require("./logger.js");
const Utils = require("./utils.js");

// Use to perform a callback. Will try several times until the callback is
// properly emitted and stop when successful (or after a given number of tries).
// Used to emit a single callback. Destroy it and create a new class for a new callback.
// Emits "success" on success, "failure" on error and "stopped" when gave up trying
// to perform the callback.
module.exports = class CallbackEmitter extends EventEmitter {

  constructor(callbackURL, message, permanent) {
    super();
    this.callbackURL = callbackURL;
    this.message = message;
    this.nextInterval = 0;
    this.timestamp = 0;
    this.permanent = permanent;
  }

  start() {
    this.timestamp = new Date().getTime();
    this.nextInterval = 0;
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
          const interval = config.get("hooks.retryIntervals")[this.nextInterval];
          if (interval != null) {
            Logger.warn(`[Emitter] trying the callback again in ${interval/1000.0} secs`);
            this.nextInterval++;
            this._scheduleNext(interval);

          // no intervals anymore, time to give up
          } else {
            this.nextInterval = config.get("hooks.permanentIntervalReset"); // Reset interval to permanent hooks
            if(this.permanent){
              this._scheduleNext(this.nextInterval);
            }
            else {
              return this.emit("stopped");
            }
          }
        }
      });
    }
    , timeout);
  }

  _emitMessage(callback) {
    let data, requestOptions;
    const serverDomain = config.get("bbb.serverDomain");
    const sharedSecret = config.get("bbb.sharedSecret");
    const bearerAuth = config.get("bbb.auth2_0");
    const timeout = config.get('hooks.requestTimeout');

    // data to be sent
    // note: keep keys in alphabetical order
    data = {
      event: "[" + this.message + "]",
      timestamp: this.timestamp,
      domain: serverDomain
    };

    if (bearerAuth) {
      const callbackURL = this.callbackURL;

      requestOptions = {
        followRedirect: true,
        maxRedirects: 10,
        uri: callbackURL,
        method: "POST",
        form: data,
        auth: {
          bearer: sharedSecret
        },
        timeout
      };
    }
    else {
      // calculate the checksum
      const checksum = Utils.checksum(`${this.callbackURL}${JSON.stringify(data)}${sharedSecret}`);

      // get the final callback URL, including the checksum
      const urlObj = url.parse(this.callbackURL, true);
      let callbackURL = this.callbackURL;
      callbackURL += _.isEmpty(urlObj.search) ? "?" : "&";
      callbackURL += `checksum=${checksum}`;

      requestOptions = {
        followRedirect: true,
        maxRedirects: 10,
        uri: callbackURL,
        method: "POST",
        form: data,
        timeout
      };
    }

    const responseFailed = (response) => {
        var statusCode = (response != null ? response.statusCode : undefined)
        // consider 401 as success, because the callback worked but was denied by the recipient
        return !((statusCode >= 200 && statusCode < 300) || statusCode == 401)
    };

    request(requestOptions, function(error, response, body) {
      if ((error != null) || responseFailed(response)) {
        Logger.warn(`[Emitter] error in the callback call to: [${requestOptions.uri}] for ${simplifiedEvent(data)}`, "error:", error, "status:", response != null ? response.statusCode : undefined);
        callback(error, false);
      } else {
        Logger.info(`[Emitter] successful callback call to: [${requestOptions.uri}] for ${simplifiedEvent(data)}`);
        callback(null, true);
      }
    });
  }
};

// A simple string that identifies the event
var simplifiedEvent = function(event) {
  if (event.event != null) {
    event = event.event
  }
  try {
    const eventJs = JSON.parse(event);
    return `event: { name: ${(eventJs.data != null ? eventJs.data.id : undefined)}, timestamp: ${(eventJs.data.event != null ? eventJs.data.event.ts : undefined)} }`;
  } catch (e) {
    return `event: ${event}`;
  }
};
