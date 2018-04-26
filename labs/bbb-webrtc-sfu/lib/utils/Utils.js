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

/*
 * isRecordedStream
 *
 * Returns the stream id if it's not a flash stream and is recorded
 */

exports.isRecordedStream = function (stream) {
  const flashStream = /^([A-z0-9]+)-([A-z0-9]+)-([A-z0-9+])(-recorded)?$/;
  const recordedStream = /^([_A-z0-9]+)-recorded$/;

  if (!stream.match(flashStream)) {
    let res = stream.match(recordedStream);
    console.log(res);
    if (res) {
      return res[1];
    }
  }

  return null;
}
