import { extractCredentials } from '/imports/api/common/server/helpers';
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
