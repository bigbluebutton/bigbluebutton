import { check } from 'meteor/check';
import { Match } from 'meteor/check';
import deepMerge from '/imports/utils/deepMerge';

export class Acl {

  constructor(config, Users) {
    this.Users = Users;
    this.config = config;
  }

  can(permission, credentials) {
    check(permission, String);
    const permissions = this.getPermissions(credentials);

    if (permissions) {
      return this.fetchPermission(permission, permissions);

    }

    return false;
  }

  fetchPermission(permission, permissions) {
    if (!permission) return false;

    if (Match.test(permissions, String)) {

      return permissions.indexOf(permission) > -1;
    } else if (Match.test(permissions, Array)) {

      return permissions.some((internalAcl) => (this.fetchPermission(permission, internalAcl)));
    } else if (Match.test(permissions, Object)) {
      if (permission.indexOf('.') > -1) {

        return this.fetchPermission(permission.substring(permission.indexOf('.') + 1),
          permissions[permission.substring(0, permission.indexOf('.'))]);

      }

      return permissions[permission];
    }
  }

  getPermissions(credentials) {
    if (!credentials) {
      return false;

    }

    let meetingId = credentials.meetingId;
    let userId = credentials.requesterUserId;
    let authToken = credentials.requesterToken;

    const user = this.Users.findOne({
      meetingId,
      userId,
    });

    if (!user) {
      return false;

    }

    const roles = user.user.roles;
    let permissions = {};

    roles.forEach((role) => {
      permissions = deepMerge(permissions, this.config[role]);
    });

    return permissions;
  }
}
