import { Meteor } from 'meteor/meteor';
import Logger from '/imports/startup/server/logger';

const allowRecentMessages = (eventName, message) => {

  const {
    userId,
    meetingId,
    time,
    rate,
    state,
  } = message;

  Logger.debug(`ExternalVideo Streamer auth allowed userId: ${userId}, meetingId: ${meetingId}, event: ${eventName}, time: ${time} rate: ${rate}, state: ${state}`);
  return true;
};

export function removeExternalVideoStreamer(meetingId) {
  const streamName = `external-videos-${meetingId}`;

  if (Meteor.StreamerCentral.instances[streamName]) {
    Logger.info(`Destroying External Video streamer object for ${streamName}`);
    delete Meteor.StreamerCentral.instances[streamName];
  }
}

export function addExternalVideoStreamer(meetingId) {

  const streamName = `external-videos-${meetingId}`;
  if (!Meteor.StreamerCentral.instances[streamName]) {

    const streamer = new Meteor.Streamer(streamName);
    streamer.allowRead(function allowRead() {
      if (!this.userId) return false;

      return this.userId && this.userId.includes(meetingId);
    });
    streamer.allowWrite('none');
    streamer.allowEmit(allowRecentMessages);
    Logger.info(`Created External Video streamer for ${streamName}`);
  } else {
    Logger.debug(`External Video streamer is already created for ${streamName}`);
  }
}

export default function get(meetingId) {
  const streamName = `external-videos-${meetingId}`;
  return Meteor.StreamerCentral.instances[streamName];
}
