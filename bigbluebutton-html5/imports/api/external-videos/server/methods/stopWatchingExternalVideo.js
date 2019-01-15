import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Meetings from '/imports/api/meetings';

export default function startStream(credentials) {
  const { meetingId } = credentials;

  Logger.info(' user sharing a new youtube video: ', credentials);

  check(meetingId, String);

  return Meetings.update({ meetingId }, { $set: { externalVideoUrl: null } });
}
