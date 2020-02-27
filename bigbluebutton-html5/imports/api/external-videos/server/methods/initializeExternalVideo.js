import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

const allowFromPresenter = (eventName, message) => {
  const {
    userId,
    meetingId,
    time,
    timestamp,
    rate,
    state,
  } = message;

  Logger.debug(`ExternalVideo Streamer auth userId: ${userId}, meetingId: ${meetingId}, event: ${eventName}, time: ${time}, timestamp: ${timestamp/1000} rate: ${rate}, state: ${state}`);

  return true;
};

export default function initializeExternalVideo() {
  const { meetingId } = extractCredentials(this.userId);

  const streamName = `external-videos-${meetingId}`;
  if (!Meteor.StreamerCentral.instances[streamName]) {
    const streamer = new Meteor.Streamer(streamName);
    streamer.allowRead('all');
    streamer.allowWrite('all');
    streamer.allowEmit(allowFromPresenter);
  } else {
    Logger.debug(`External Video streamer is already created for ${streamName}`);
  }
}
