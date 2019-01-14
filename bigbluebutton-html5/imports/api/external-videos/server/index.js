import { Meteor } from 'meteor/meteor';

import ExternalVideoStreamer from '/imports/api/external-videos';
import Users from '/imports/api/users';

import Logger from '/imports/startup/server/logger';

import './methods'; 

ExternalVideoStreamer.allowRead('all');
ExternalVideoStreamer.allowWrite('all');

const allowFromPresenter = (eventName, {userId, meetingId}) => {
  let user = Users.findOne({userId});

  let ret = user && user.presenter;

  Logger.debug('Auth userid:', userId, ' event: ', eventName, ' suc: ', ret);

  return ret || eventName == 'viewerJoined';

}

ExternalVideoStreamer.allowEmit(allowFromPresenter);
