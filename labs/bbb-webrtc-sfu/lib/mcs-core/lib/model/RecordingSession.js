/**
 * @classdesc
 * Model class for Recording
 */

'use strict'

const config = require('config');
const MediaSession = require('./MediaSession');

module.exports = class RecordingSession extends MediaSession {
  constructor(emitter, room, recordingPath) {
    const uri = recordingPath;
    const options = {
      mediaProfile: config.get('recordingMediaProfile'),
      uri: uri,
      stopOnEndOfStream: true
    };

    super(emitter, room, 'RecorderEndpoint', options);
    this.filename = uri;
  }

  async process () {
    const answer = await this._MediaServer.startRecording(this._mediaElement);
    return Promise.resolve({ recordingId: this.id, filename: this.filename, meetingId: this.room });
  }
}
