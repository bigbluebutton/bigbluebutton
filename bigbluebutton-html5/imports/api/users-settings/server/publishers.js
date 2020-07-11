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

  function transformUserSetting(uSetting) {
    if (uSetting.userId === requesterUserId) {
      return uSetting;
    }
    return {
      meetingId,
      userId: uSetting.userId,
      setting: uSetting.setting,
      value: otherUsersExportSettings.includes(uSetting.setting) ? uSetting.value : undefined,
    };
  }
  const self = this;
  const observer = UserSettings.find({ meetingId }).observe({
    added(document) {
      self.added('users-settings', document._id, transformUserSetting(document));
    },
    // eslint-disable-next-line no-unused-vars
    changed(newDocument, oldDocument) {
      self.changed('users-settings', newDocument._id, transformUserSetting(newDocument));
    },
    removed(oldDocument) {
      self.removed('users-settings', oldDocument._id);
    },
  });
  self.onStop(() => {
    observer.stop();
  });
  self.ready();
  return observer;
}

function publish(...args) {
  const boundUserSettings = userSettings.bind(this);
  return boundUserSettings(...args);
}

Meteor.publish('users-settings', publish);
