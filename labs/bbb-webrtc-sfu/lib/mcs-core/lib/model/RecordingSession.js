/**
 * @classdesc
 * Model class for Recording
 */

'use strict'

const config = require('config');
const MediaSession = require('./MediaSession');

module.exports = class RecordingSession extends MediaSession {
  constructor(emitter, room, recordingName) {
    let uri = RecordingSession.getRecordingPath(room, 'medium', recordingName);
    let options = {
      mediaProfile: 'MP4_VIDEO_ONLY',
      uri: uri,
      stopOnEndOfStream: true
    };

    super(emitter, room, 'RecorderEndpoint', options);
    this.filename = uri;
  }

  static getRecordingPath (room, profile, recordingName) {
    const basePath = config.get('recordingBasePath');
    const timestamp = (new Date()).getTime();

    return `${basePath}/${room}/${profile}-${recordingName}-${timestamp}.mp4`;
  }

  async process () {
    const answer = await this._MediaServer.startRecording(this._mediaElement);
    return Promise.resolve({ recordingId: this.id, filename: this.filename });
  }
}
