import _ from 'lodash';
import { check } from 'meteor/check';
import LocalSettings from '/imports/api/local-settings';
import setChangedLocalSettings from '../modifiers/setChangedLocalSettings';

export default function userChangedLocalSettings(credentials, settings) {
  const { meetingId, requesterUserId } = credentials;

  if (!meetingId || !requesterUserId) return;

  check(meetingId, String);
  check(requesterUserId, String);
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
