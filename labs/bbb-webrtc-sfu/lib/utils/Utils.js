/**
 *  * @classdesc
 *   * Utils class for bbb-webrtc-sfu
 *    * @constructor
 *     */


/*
 * hrTime
 * Gets monotonic system time in milliseconds
 */

exports.hrTime = function () {
  let t = process.hrtime();

  return t[0]*1000 + parseInt(t[1]/1000000);
}
