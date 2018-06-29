/**
 *  @classdesc
 *  Utils class for mcs-core
 *  @constructor
 *
 */

exports.isError = function (error) {
  return error && error.stack && error.message && typeof error.stack === 'string'
    && typeof error.message === 'string';
}
