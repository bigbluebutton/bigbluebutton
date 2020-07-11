import { Meteor } from 'meteor/meteor';
import UserSettings from '/imports/api/users-settings';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';
import User from '/imports/api/users';

const otherUsersExportSettings = ['bb2b_magic_cap_user'];

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

  return UserSettings.find({ meetingId }, {
    "transform": function (uSetting) {
      if (uSetting.userId === requesterUserId) {
        return uSetting;
      }
      if (otherUsersExportSettings.includes(uSetting.setting)) {
        return {
          meetingId,
          userId: uSetting.userId,
          setting: uSetting.setting,
          value: uSetting.value,
        };
      }
      return null;
    },
  });
}

function publish(...args) {
  const boundUserSettings = userSettings.bind(this);
  return boundUserSettings(...args);
}

Meteor.publish('users-settings', publish);
