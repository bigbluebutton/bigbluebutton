import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Users from '/imports/api/users';
import Logger from '/imports/startup/server/logger';

const allowFromPresenter = (eventName, { userId }) => {
  const user = Users.findOne({ userId });
  const ret = user && user.presenter;

  Logger.debug('ExternalVideo Streamer auth userid:', userId, ' event: ', eventName, ' suc: ', ret);

  return ret || eventName === 'viewerJoined';
};

export default function initializeExternalVideo(credentials, options) {
  const { meetingId } = credentials;

  check(meetingId, String);

  let streamer = new Meteor.Streamer(`external-videos-${meetingId}`);
  streamer.allowRead('all');
  streamer.allowWrite('all');
  streamer.allowEmit(allowFromPresenter);
}
