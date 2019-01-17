import ExternalVideoStreamer from '/imports/api/external-videos';
import Users from '/imports/api/users';
import Logger from '/imports/startup/server/logger';
import './methods';

ExternalVideoStreamer.allowRead('all');
ExternalVideoStreamer.allowWrite('all');

const allowFromPresenter = (eventName, { userId }) => {
  const user = Users.findOne({ userId });
  const ret = user && user.presenter;

  Logger.debug('ExternalVideo Streamer auth userid:', userId, ' event: ', eventName, ' suc: ', ret);

  return ret || eventName === 'viewerJoined';
};

ExternalVideoStreamer.allowEmit(allowFromPresenter);
