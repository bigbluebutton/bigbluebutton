/**
 * @classdesc
 * Model class for Recording
 */

'use strict'

const config = require('config');
const MediaSession = require('./MediaSession');

module.exports = class RecordingSession extends MediaSession {
  constructor(emitter, room, recordingName) {
    let options = {
      mediaProfile: 'MP4_VIDEO_ONLY',
      uri: RecordingSession.getRecordingPath(room, 'medium', recordingName),
      stopOnEndOfStream: true
    };

    super(emitter, room, 'RecorderEndpoint', options);
  }

  static getRecordingPath (room, profile, recordingName) {
    const basePath = config.get('recordingBasePath');
    const timestamp = (new Date()).getTime();

    return `${basePath}/${room}/${profile}-${recordingName}-${timestamp}.mp4`;
  }

  async process () {
    const answer = await this._MediaServer.startRecording(this._mediaElement);
    return Promise.resolve(answer);
  }
}
