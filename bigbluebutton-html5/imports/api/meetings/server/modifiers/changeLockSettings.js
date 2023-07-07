import Logger from '/imports/startup/server/logger';
import Meetings from '/imports/api/meetings';
import { check } from 'meteor/check';

export default async function changeLockSettings(meetingId, payload) {
  check(meetingId, String);
  check(payload, {
    disableCam: Boolean,
    disableMic: Boolean,
    disablePrivChat: Boolean,
    disablePubChat: Boolean,
    disableNotes: Boolean,
    hideUserList: Boolean,
    lockOnJoin: Boolean,
    lockOnJoinConfigurable: Boolean,
    hideViewersCursor: Boolean,
    hideViewersAnnotation: Boolean,
    setBy: Match.Maybe(String),
  });

  const {
    disableCam,
    disableMic,
    disablePrivChat,
    disablePubChat,
    disableNotes,
    hideUserList,
    lockOnJoin,
    lockOnJoinConfigurable,
    hideViewersCursor,
    hideViewersAnnotation,
    setBy,
  } = payload;

  const selector = {
    meetingId,
  };

  const modifier = {
    $set: {
      lockSettingsProps: {
        disableCam,
        disableMic,
        disablePrivateChat: disablePrivChat,
        disablePublicChat: disablePubChat,
        disableNotes,
        hideUserList,
        lockOnJoin,
        lockOnJoinConfigurable,
        hideViewersCursor,
        hideViewersAnnotation,
        setBy,
      },
    },
  };

  try {
    const { numberAffected } = await Meetings.upsertAsync(selector, modifier);
    if (numberAffected) {
      Logger.info(`Changed meeting={${meetingId}} updated lock settings`);
    } else {
      Logger.info(`meeting={${meetingId}} lock settings were not updated`);
    }
  } catch (err) {
    Logger.error(`Changing meeting={${meetingId}} lock settings: ${err}`);
  }
}
