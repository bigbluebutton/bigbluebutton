import { check } from 'meteor/check';
import LocalSettings from '/imports/api/local-settings';
import setChangedLocalSettings from '../modifiers/setChangedLocalSettings';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';
import { isEqual } from 'radash';

export default async function userChangedLocalSettings(settings) {
  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    if (!meetingId || !requesterUserId) return;

    check(settings, Object);
    check(meetingId, String);
    check(requesterUserId, String);

    const userLocalSettings = await LocalSettings
      .findOneAsync({ meetingId, userId: requesterUserId },
        {
          fields: { settings: 1 },
        });

    if (!userLocalSettings || !isEqual(userLocalSettings.settings, settings)) {
      await setChangedLocalSettings(meetingId, requesterUserId, settings);
    }
  } catch (err) {
    Logger.error(`Exception while invoking method userChangedLocalSettings ${err.stack}`);
  }
}
