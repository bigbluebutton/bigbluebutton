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
    const format = 'mp4';
    const basePath = config.get('recordingBasePath');
    const timestamp = (new Date()).getTime();

    let isScreenshare = (name) => {
      return name.match(/^[0-9]+-SCREENSHARE$/);
    };

    if (isScreenshare(recordingName)) {
      return `${basePath}/${room}-SCREENSHARE/${recordingName}-${timestamp}.${format}`
    } else {
      return `${basePath}/${room}/${profile}-${recordingName}-${timestamp}.${format}`;
    }

  }

  async process () {
    const answer = await this._MediaServer.startRecording(this._mediaElement);
    return Promise.resolve({ recordingId: this.id, filename: this.filename, meetingId: this.room });
  }
}
