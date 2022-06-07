import Logger from '/imports/startup/server/logger';

export function removeAnnotationsStreamer(meetingId) {
  Logger.info(`Removing Annotations streamer object for meeting ${meetingId}`);
  delete Meteor.StreamerCentral.instances[`annotations-${meetingId}`];
}

export function addAnnotationsStreamer(meetingId) {
  const streamer = new Meteor.Streamer(`annotations-${meetingId}`, { retransmit: false });

  streamer.allowRead(function allowRead() {
    if (!this.userId) return false;

    return this.userId && this.userId.includes(meetingId);
  });

  streamer.allowWrite(function allowWrite() {
    return false;
  });
}

export default function get(meetingId) {
  return Meteor.StreamerCentral.instances[`annotations-${meetingId}`];
}
