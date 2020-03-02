import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';

const allowRecentMessages = (eventName, message) => {
  const LATE_MESSAGE_THRESHOLD = 3000;

  const {
    userId,
    meetingId,
    time,
    timestamp,
    rate,
    state,
  } = message;

  if (timestamp > Date.now() - LATE_MESSAGE_THRESHOLD) {
    Logger.debug(`ExternalVideo Streamer auth allowed userId: ${userId}, meetingId: ${meetingId}, event: ${eventName}, time: ${time}, timestamp: ${timestamp/1000} rate: ${rate}, state: ${state}`);
    return true;
  }

  Logger.debug(`ExternalVideo Streamer auth rejected userId: ${userId}, meetingId: ${meetingId}, event: ${eventName}, time: ${time}, timestamp: ${timestamp/1000} rate: ${rate}, state: ${state}`);

  return false;
};

export default function initializeExternalVideo() {
  const { meetingId } = extractCredentials(this.userId);

  const streamName = `external-videos-${meetingId}`;
  if (!Meteor.StreamerCentral.instances[streamName]) {
    const streamer = new Meteor.Streamer(streamName);
    streamer.allowRead('all');
    streamer.allowWrite('none');
    streamer.allowEmit(allowRecentMessages);
    Logger.info(`Created External Video streamer for ${streamName}`);
  } else {
    Logger.debug(`External Video streamer is already created for ${streamName}`);
  }
}
