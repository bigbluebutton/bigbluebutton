import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Users from '/imports/api/users';
import Logger from '/imports/startup/server/logger';

const allowFromPresenter = (eventName, message) => {
  const {
    userId,
    time,
    rate,
    state,
  } = message;

  const user = Users.findOne({ userId });
  const ret = user && user.presenter;

  Logger.info(`ExternalVideo Streamer auth userid: ${userId}, meetingId: ${user.meetingId}, event: ${eventName}, suc: ${ret}, time: ${time}, rate: ${rate}, state: ${state}`);

  return ret;
};

export default function initializeExternalVideo(credentials) {
  const { meetingId } = credentials;

  check(meetingId, String);

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
