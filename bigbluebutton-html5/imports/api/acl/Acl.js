import { check } from 'meteor/check';
import { Match } from 'meteor/check';

export class Acl {

  constructor(config, Users) {
    this.Users = Users;
    this.config = config;
  }

  can(permission, credentials) {
    check(permission, String);
    const roles = this.getRole(credentials);

    if (roles) {
      return this.fetchPermission(permission, this.config[roles.toLowerCase()]);
    }
    return false;
  }

  fetchPermission(permission, roles) {
    if (!permission) return false;

    if (Match.test(roles, String)) {
      return roles.indexOf(permission) > -1;
    } else if (Match.test(roles, Array)) {
      return roles.some((internalAcl)=>(this.fetchPermission(permission, internalAcl)));
    } else if (Match.test(roles, Object)) {
      if (permission.indexOf(".") > -1) {
        return this.fetchPermission(permission.substring(permission.indexOf(".") + 1), roles[permission.substring(0, permission.indexOf("."))]);
      }
      return roles[permission];
    }
  }

  getRole(credentials) {
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
    return user.user.role;
  }
}
