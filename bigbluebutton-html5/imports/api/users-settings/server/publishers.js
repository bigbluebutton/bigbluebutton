import { Meteor } from 'meteor/meteor';
import UserSettings from '/imports/api/users-settings';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';
import User from '/imports/api/users';

const otherUsersExportSettings = ['bbb_magic_cap_user'];

function userSettings() {
  if (!this.userId) {
    return UserSettings.find({ meetingId: '' });
  }
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  const currentUser = User.findOne({ userId: requesterUserId });

  if (currentUser && currentUser.breakoutProps.isBreakoutUser) {
    const { parentId } = currentUser.breakoutProps;

    const [externalId] = currentUser.extId.split('-');

    const mainRoomUserSettings = UserSettings.find({ meetingId: parentId, userId: externalId });

    mainRoomUserSettings.map(({ setting, value }) => ({
      meetingId,
      setting,
      userId: requesterUserId,
      value,
    })).forEach((doc) => {
      const selector = {
        meetingId,
        setting: doc.setting,
      };

      UserSettings.upsert(selector, doc);
    });

    Logger.debug(`Publishing user settings for user=${requesterUserId}`);

    return UserSettings.find({ meetingId, userId: requesterUserId });
  }

  Logger.debug(`Publishing user settings for user=${requesterUserId}`);

  const userSettingsExtracted = UserSettings.find({ meetingId, userId: requesterUserId });
  // eslint-disable-next-line max-len
  const otherUserSettings = UserSettings.find({ meetingId, $not: { userId: requesterUserId } });
  otherUsersExportSettings.forEach(
    (settingKey) => {
      otherUserSettings.forEach((otherUserSetting) => {
        if (otherUserSetting.setting === settingKey) {
          userSettingsExtracted.push({
            meetingId,
            userId: otherUserSetting.userId,
            setting: otherUserSetting.setting,
            value: otherUserSetting.value,
          });
        }
      });
    },
  );

  return userSettingsExtracted;
}

function publish(...args) {
  const boundUserSettings = userSettings.bind(this);
  return boundUserSettings(...args);
}

Meteor.publish('users-settings', publish);
