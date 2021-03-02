import Logger from '/imports/startup/server/logger';
import publishCursorUpdate from './methods/publishCursorUpdate';

const { streamerLog } = Meteor.settings.private.serverLog;

export function removeCursorStreamer(meetingId) {
  Logger.info(`Removing Cursor streamer object for meeting ${meetingId}`);
  delete Meteor.StreamerCentral.instances[`cursor-${meetingId}`];
}

export function addCursorStreamer(meetingId) {
  const streamer = new Meteor.Streamer(`cursor-${meetingId}`, { retransmit: false });
  if (streamerLog) {
    Logger.debug('Cursor streamer created', { meetingId });
  }

  streamer.allowRead(function allowRead() {
    if (streamerLog) {
      Logger.debug('Cursor streamer called allowRead', { userId: this.userId, meetingId });
    }
    return this.userId && this.userId.includes(meetingId);
  });

  streamer.allowWrite(function allowWrite() {
    return this.userId && this.userId.includes(meetingId);
  });

  streamer.on('publish', (message) => {
    publishCursorUpdate(meetingId, message.userId, message.payload);
  });
}

export default function get(meetingId) {
  return Meteor.StreamerCentral.instances[`cursor-${meetingId}`];
}
