import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Meetings from '/imports/api/meetings';
import { Meteor } from 'meteor/meteor';
import handleLockingMic from '/imports/api/users/server/modifiers/handleLockingMic';

export default function handlePermissionSettingsChange({ payload }) {
  const meetingId = payload.meeting_id;
  const permissions = payload.permissions;

  check(meetingId, String);
  check(permissions, Object);

  const selector = {
    meetingId,
  };

  const Meeting = Meetings.findOne(selector);

  if (!Meeting) {
    throw new Meteor.Error('meeting-not-found', `Meeting id=${meetingId} was not found`);
  }

  const modifier = {
    $set: {
      roomLockSettings: {
        disablePrivateChat: permissions.disablePrivateChat,
        disableCam: permissions.disableCam,
        disableMic: permissions.disableMic,
        lockOnJoin: permissions.lockOnJoin,
        lockedLayout: permissions.lockedLayout,
        disablePublicChat: permissions.disablePublicChat,
        lockOnJoinConfigurable: permissions.lockOnJoinConfigurable,
      },
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Updating meeting permissions: ${err}`);
    }

    if (permissions.disableMic) {
      handleLockingMic(meetingId, permissions);
    }

    if (numChanged) {
      return Logger.info(`Updated meeting permissions id=${meetingId}`);
    }
  };

  return Meetings.update(selector, modifier, cb);
};
