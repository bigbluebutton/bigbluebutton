import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import setMobile from '../modifiers/setMobile';

export default function setMobileUser(credentials) {
  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);

  Logger.verbose(`Mobile user ${requesterUserId} from meeting ${meetingId}`);

  setMobile(meetingId, requesterUserId);
}
