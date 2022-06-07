import _ from 'lodash';
import { check } from 'meteor/check';
import LocalSettings from '/imports/api/local-settings';
import setChangedLocalSettings from '../modifiers/setChangedLocalSettings';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';

export default function userChangedLocalSettings(settings) {
  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    if (!meetingId || !requesterUserId) return;

    check(settings, Object);
    check(meetingId, String);
    check(requesterUserId, String);

    const userLocalSettings = LocalSettings
      .findOne({ meetingId, userId: requesterUserId },
        {
          fields: { settings: 1 },
        });

    if (!userLocalSettings || !_.isEqual(userLocalSettings.settings, settings)) {
      setChangedLocalSettings(meetingId, requesterUserId, settings);
    }
  } catch (err) {
    Logger.error(`Exception while invoking method userChangedLocalSettings ${err.stack}`);
  }
}
