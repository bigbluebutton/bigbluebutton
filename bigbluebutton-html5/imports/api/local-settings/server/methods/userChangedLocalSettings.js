import _ from 'lodash';
import { check } from 'meteor/check';
import LocalSettings from '/imports/api/local-settings';
import setChangedLocalSettings from '../modifiers/setChangedLocalSettings';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function userChangedLocalSettings(settings) {
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  if (!meetingId || !requesterUserId) return;

  check(settings, Object);

  const userLocalSettings = LocalSettings
    .findOne({ meetingId, userId: requesterUserId },
      {
        fields: { settings: 1 },
      });

  if (!userLocalSettings || !_.isEqual(userLocalSettings.settings, settings)) {
    setChangedLocalSettings(meetingId, requesterUserId, settings);
  }
}
