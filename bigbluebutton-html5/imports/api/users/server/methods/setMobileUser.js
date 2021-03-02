import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import setMobile from '../modifiers/setMobile';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function setMobileUser() {
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  check(meetingId, String);
  check(requesterUserId, String);

  Logger.verbose(`Mobile user ${requesterUserId} from meeting ${meetingId}`);

  setMobile(meetingId, requesterUserId);
}
