
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import deepMerge from '/imports/utils/deepMerge';

export default class Acl {
  constructor(config, Users) {
    this.Users = Users;
    this.config = config;
  }

  can(permission, credentials) {
    check(permission, String);
    const permissions = this.getPermissions(credentials);

    return this.checkToken(credentials) && this.fetchPermission(permission, permissions);
  }

  checkToken(credentials) {
    // skip token check in client `can` calls since we dont have the authToken in the collection
    if (!Meteor.isServer) return true;

    const { meetingId, requesterUserId: userId, requesterToken: authToken } = credentials;

    const User = this.Users.findOne({
      meetingId,
      userId,
      authToken,
      validated: true,
      connectionStatus: 'online',
      // TODO: We cant check for approved until we move subscription login out of <Base />
      // approved: true,
    });

    return !!User; // if he found a user means the meeting/user/token is valid
  }

  fetchPermission(permission, permissions) {
    if (!permission) return false;

    if (Match.test(permissions, String)) {
      return permissions.indexOf(permission) > -1;
    } else if (Match.test(permissions, Array)) {
      return permissions.some(internalAcl => (this.fetchPermission(permission, internalAcl)));
    } else if (Match.test(permissions, Object)) {
      if (permission.indexOf('.') > -1) {
        return this.fetchPermission(
          permission.substring(permission.indexOf('.') + 1),
          permissions[permission.substring(0, permission.indexOf('.'))],
        );
      }
      return permissions[permission];
    }
    return false;
  }

  getPermissions(credentials) {
    if (!credentials) {
      return false;
    }

    const { meetingId, requesterUserId: userId } = credentials;

    const user = this.Users.findOne({
      meetingId,
      userId,
    });

    const containRole = Acl.containsRole(user);

    if (containRole) {
      const { roles } = user;
      let permissions = {};

      roles.forEach((role) => {
        // There is a big issue here, if we just send the content from the this.config
        // inside the deepMerge, we change both permissions and the config.
        // Couldn't find a better way to prevent the changing.
        // The problems occurs in the `sources.shift()`.
        permissions = deepMerge(permissions, JSON.parse(JSON.stringify(this.config[role])));
      });

      return permissions;
    }
    return false;
  }

  static containsRole(user) {
    return Match.test(user, Object) &&
      Match.test(user.roles, Array);
  }
}
