import { Meteor } from 'meteor/meteor';
import UserSettings from '/imports/api/users-settings';
import Logger from '/imports/startup/server/logger';
import AuthTokenValidation, { ValidationStates } from '/imports/api/auth-token-validation';
import User from '/imports/api/users';

function userSettings() {
  const tokenValidation = AuthTokenValidation.findOne({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing UserSettings was requested by unauth connection ${this.connection.id}`);
    return UserSettings.find({ meetingId: '' });
  }

  const { meetingId, userId } = tokenValidation;

  const currentUser = User.findOne({ userId, meetingId });

  if (currentUser && currentUser?.breakoutProps?.isBreakoutUser) {
    const { parentId } = currentUser.breakoutProps;

    const [externalId] = currentUser.extId.split('-');

    const mainRoomUserSettings = UserSettings.find({ meetingId: parentId, userId: externalId });

    mainRoomUserSettings.map(({ setting, value }) => ({
      meetingId,
      setting,
      userId,
      value,
    })).forEach((doc) => {
      const selector = {
        meetingId,
        setting: doc.setting,
      };

      UserSettings.upsert(selector, doc);
    });

    Logger.debug('Publishing UserSettings', { meetingId, userId });

    return UserSettings.find({ meetingId, userId });
  }

  Logger.debug('Publishing UserSettings', { meetingId, userId });

  return UserSettings.find({ meetingId, userId });
}

function publish(...args) {
  const boundUserSettings = userSettings.bind(this);
  return boundUserSettings(...args);
}

Meteor.publish('users-settings', publish);
