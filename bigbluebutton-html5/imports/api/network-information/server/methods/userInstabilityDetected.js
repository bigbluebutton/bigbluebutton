import { check } from 'meteor/check';
import NetworkInformation from '/imports/api/network-information';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function userInstabilityDetected(sender) {
  const { meetingId, requesterUserId: receiver } = extractCredentials(this.userId);
  check(sender, String);

  const payload = {
    time: new Date().getTime(),
    meetingId,
    receiver,
    sender,
  };

  Logger.debug('Receiver reported a network instability', { receiver, meetingId });

  return NetworkInformation.insert(payload);
}
