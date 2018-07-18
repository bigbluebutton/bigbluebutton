/**
 *  @classdesc
 *  Utils class for mcs-core
 *  @constructor
 *
 */

const C = require('../constants/Constants');

exports.isError = (error) => {
  return error && error.stack && error.message && typeof error.stack === 'string'
    && typeof error.message === 'string';
}

exports.handleError = (logPrefix, error) => {
  let { message, code, stack, data, details } = error;

  if (code && code >= C.ERROR.MIN_CODE && code <= C.ERROR.MAX_CODE) {
    return error;
  }

  if (code == null) {
    ({ code, message } = C.ERROR.MEDIA_GENERIC_ERROR);
  }
  else {
    ({ code, message } = error);
  }

  if (!isError(error)) {
    error = new Error(message);
  }

  error.code = code;
  error.message = message;
  error.stack = stack

  if (details) {
    error.details = details;
  }
  else {
    error.details = message;
  }

  Logger.debug(logPrefix, "Handling error", error.code, error.message);
  Logger.trace(logPrefix, error.stack);

  return error;
}
