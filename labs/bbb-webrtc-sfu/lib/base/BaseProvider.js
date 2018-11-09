"use strict";

const C = require('../bbb/messages/Constants');
const Logger = require('../utils/Logger');
const EventEmitter = require('events').EventEmitter;
const errors = require('../base/errors');
const config = require('config');
const LOG_PREFIX = '[base-provider]';

module.exports = class BaseProvider extends EventEmitter {
  constructor () {
    super();
    this.sfuApp = "base";
  }

  serverState (event) {
    let code = null;
    const { eventTag } = { ...event };
    if (eventTag && eventTag.code) {
      code = eventTag.code;
    }

    switch (code) {
      case C.MEDIA_SERVER_OFFLINE:
        Logger.error(LOG_PREFIX, "Provider received MEDIA_SERVER_OFFLINE event");
        this.emit(C.MEDIA_SERVER_OFFLINE, event);
        break;

      default:
        Logger.warn(LOG_PREFIX, "Unknown server state", event);
    }
  }


  _handleError (logPrefix, error, role, streamId) {
    // Setting a default error in case it was unhandled
    if (error == null) {
      error = { code: 2200, reason: errors[2200] }
    }

    if (this._validateErrorMessage(error)) {
      return error;
    }

    const { code } = error;
    const reason = errors[code];

    if (reason == null) {
      return;
    }

    error.message = reason;

    Logger.debug(logPrefix, "Handling error", error.code, error.message);
    Logger.trace(logPrefix, error.stack);

    return this._assembleErrorMessage(error, role, streamId);
  }

  _assembleErrorMessage (error, role, streamId) {
    return {
      type: this.sfuApp,
      id: 'error',
      role,
      streamId,
      code: error.code,
      reason: error.message,
    };
  }

  _validateErrorMessage (error) {
    const {
      type = null,
      id = null,
      role = null,
      streamId = null,
      code = null,
      reason = null,
    } = error;
    return type && id && role && streamId && code && reason;
  }

  getRecordingPath (room, subPath, recordingName) {
    const format = config.get('recordingFormat');
    const basePath = config.get('recordingBasePath');
    const timestamp = (new Date()).getTime();

    return `${basePath}/${subPath}/${room}/${recordingName}-${timestamp}.${format}`
  }
};
