import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import { getFromSpecificUserSettings } from '/imports/ui/services/users-settings';

export default function isGhostUser(user) {
    return getFromSpecificUserSettings(user.userId, 'bbb_ghost_user', false);
}