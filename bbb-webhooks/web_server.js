const _ = require("lodash");
const express = require("express");
const url = require("url");

const config = require("./config.js");
const Hook = require("./hook.js");
const Logger = require("./logger.js");
const Utils = require("./utils.js");

// Web server that listens for API calls and process them.
module.exports = class WebServer {

  constructor() {
    this._validateChecksum = this._validateChecksum.bind(this);
    this.app = express();
    this._registerRoutes();
  }

  start(port, callback) {
    this.server = this.app.listen(port);
    if (this.server.address() == null) {
      Logger.error("[WebServer] aborting, could not bind to port", port,
      process.exit(1));
    }
    Logger.info("[WebServer] listening on port", port, "in", this.app.settings.env.toUpperCase(), "mode");
    typeof callback === 'function' ? callback(null,"k") : undefined;
  }

  _registerRoutes() {
    // Request logger
    this.app.all("*", function(req, res, next) {
      if (!fromMonit(req)) {
        Logger.info("[WebServer]", req.method, "request to", req.url, "from:", clientDataSimple(req));
      }
      next();
    });

    this.app.get("/bigbluebutton/api/hooks/create", this._validateChecksum, this._create);
    this.app.get("/bigbluebutton/api/hooks/destroy", this._validateChecksum, this._destroy);
    this.app.get("/bigbluebutton/api/hooks/list", this._validateChecksum, this._list);
    this.app.get("/bigbluebutton/api/hooks/ping", function(req, res) {
      res.write("bbb-webhooks up!");
      res.end();
    });
  }

  _create(req, res, next) {
    const urlObj = url.parse(req.url, true);
    const callbackURL = urlObj.query["callbackURL"];
    const meetingID = urlObj.query["meetingID"];
    let getRaw = urlObj.query["getRaw"];
    if (getRaw){
      getRaw = JSON.parse(getRaw.toLowerCase());
    } else {
      getRaw = false;
    }

    if (callbackURL == null) {
      respondWithXML(res, config.api.responses.missingParamCallbackURL);
    } else {
      Hook.addSubscription(callbackURL, meetingID, getRaw, function(error, hook) {
        let msg;
        if (error != null) { // the only error for now is for duplicated callbackURL
          msg = config.api.responses.createDuplicated(hook.id);
        } else if (hook != null) {
          msg = config.api.responses.createSuccess(hook.id, hook.permanent, hook.getRaw);
        } else {
          msg = config.api.responses.createFailure;
        }
        respondWithXML(res, msg);
      });
    }
  }
  // Create a permanent hook. Permanent hooks can't be deleted via API and will try to emit a message until it succeed
  createPermanents(callback) {
    for (let i = 0; i < config.hooks.permanentURLs.length; i++) {
      Hook.addSubscription(config.hooks.permanentURLs[i].url, null, config.hooks.permanentURLs[i].getRaw, function(error, hook) {
        if (error != null) { // there probably won't be any errors here
          Logger.info("[WebServer] duplicated permanent hook", error);
        } else if (hook != null) {
          Logger.info("[WebServer] permanent hook created successfully");
        } else {
          Logger.info("[WebServer] error creating permanent hook");
        }
      });
    }
    typeof callback === 'function' ? callback(null,"p") : undefined;
  }

  _destroy(req, res, next) {
    const urlObj = url.parse(req.url, true);
    const hookID = urlObj.query["hookID"];

    if (hookID == null) {
      respondWithXML(res, config.api.responses.missingParamHookID);
    } else {
      Hook.removeSubscription(hookID, function(error, result) {
        let msg;
        if (error != null) {
          msg = config.api.responses.destroyFailure;
        } else if (!result) {
          msg = config.api.responses.destroyNoHook;
        } else {
          msg = config.api.responses.destroySuccess;
        }
        respondWithXML(res, msg);
      });
    }
  }

  _list(req, res, next) {
    let hooks;
    const urlObj = url.parse(req.url, true);
    const meetingID = urlObj.query["meetingID"];

    if (meetingID != null) {
      // all the hooks that receive events from this meeting
      hooks = Hook.allGlobalSync();
      hooks = hooks.concat(Hook.findByExternalMeetingIDSync(meetingID));
      hooks = _.sortBy(hooks, hook => hook.id);
    } else {
      // no meetingID, return all hooks
      hooks = Hook.allSync();
    }

    let msg = "<response><returncode>SUCCESS</returncode><hooks>";
    hooks.forEach(function(hook) {
      msg += "<hook>";
      msg +=   `<hookID>${hook.id}</hookID>`;
      msg +=   `<callbackURL><![CDATA[${hook.callbackURL}]]></callbackURL>`;
      if (!hook.isGlobal()) { msg +=   `<meetingID><![CDATA[${hook.externalMeetingID}]]></meetingID>`; }
      msg +=   `<permanentHook>${hook.permanent}</permanentHook>`;
      msg +=   `<rawData>${hook.getRaw}</rawData>`;
      msg += "</hook>";
    });
    msg += "</hooks></response>";

    respondWithXML(res, msg);
  }

  // Validates the checksum in the request `req`.
  // If it doesn't match BigBlueButton's shared secret, will send an XML response
  // with an error code just like BBB does.
  _validateChecksum(req, res, next) {
    const urlObj = url.parse(req.url, true);
    const checksum = urlObj.query["checksum"];

    if (checksum === Utils.checksumAPI(req.url, config.bbb.sharedSecret)) {
      next();
    } else {
      Logger.info("[WebServer] checksum check failed, sending a checksumError response");
      res.setHeader("Content-Type", "text/xml");
      res.send(cleanupXML(config.api.responses.checksumError));
    }
  }
};

var respondWithXML = function(res, msg) {
  msg = cleanupXML(msg);
  Logger.info("[WebServer] respond with:", msg);
  res.setHeader("Content-Type", "text/xml");
  res.send(msg);
};

// Returns a simple string with a description of the client that made
// the request. It includes the IP address and the user agent.
var clientDataSimple = req => `ip ${Utils.ipFromRequest(req)}, using ${req.headers["user-agent"]}`;

// Cleans up a string with an XML in it removing spaces and new lines from between the tags.
var cleanupXML = string => string.trim().replace(/>\s*/g, '>');

// Was this request made by monit?
var fromMonit = req => (req.headers["user-agent"] != null) && req.headers["user-agent"].match(/^monit/);
