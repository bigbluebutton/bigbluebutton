import getFromSpecificUserSettings from '/imports/ui/services/users-settings';

export default function isGhostUser(user) {
    return getFromSpecificUserSettings(user.userId, 'bbb_ghost_user', false);
}