import { check } from 'meteor/check';
import NetworkInformation from '/imports/api/network-information';
import Logger from '/imports/startup/server/logger';

export default function userInstabilityDetected(credentials, sender) {
  const { meetingId, requesterUserId: receiver } = credentials;

  check(meetingId, String);
  check(receiver, String);
  check(sender, String);

  const payload = {
    time: new Date().getTime(),
    meetingId,
    receiver,
    sender,
  };

  Logger.debug(`Receiver ${receiver} reported a network instability in meeting ${meetingId}`);

  return NetworkInformation.insert(payload);
}
