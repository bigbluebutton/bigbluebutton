const streamers = {};


export function removeAnnotationsStreamer(meetingId) {
  delete streamers[meetingId];
}

export function addAnnotationsStreamer(meetingId) {
  const streamer = new Meteor.Streamer(`annotations-${meetingId}`, { retransmit: false });

  streamer.allowRead(function a() {
    if (!this.userId) return false;

    return this.userId && this.userId.includes(meetingId);
  });

  streamer.allowWrite(function allowWrite() {
    return false;
  });

  streamers[meetingId] = streamer;
}

export default function get(meetingId) {
  return streamers[meetingId];
}
