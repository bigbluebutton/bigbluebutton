import { Meteor } from 'meteor/meteor';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function destroyExternalVideo() {
  const { meetingId } = extractCredentials(this.userId);
  const streamName = `external-videos-${meetingId}`;

  if (Meteor.StreamerCentral.instances[streamName]) {
    Logger.info(`Destroying External Video streamer object for ${streamName}`);
    delete Meteor.StreamerCentral.instances[streamName];
  }
}
