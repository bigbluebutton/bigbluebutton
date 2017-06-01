import { check } from 'meteor/check';
import Users from '/imports/api/users/'

export class Acl {

  constructor(config, Users) {
    this.Users = Users;
    this.config = config;
  }

  subscribe(channel,credentials){
    check(channel, String);

    let subscriptions = this.getSubscriptions(credentials);

    if (subscriptions) {
      return this.checkPermission(channel, subscriptions);
    }
    return false;
  }

  getSubscriptions(credentials){
    let role = this.getRole(credentials);

    if(!role.subscriptions){
      return [];
    }
    return role.subscriptions;
  }

  getMethods(credentials){
    let role = this.getRole(credentials);
    if(!role.methods){
      return [];
    }
    return role.methods;
  }

  can(permission, credentials) {
    let methods = this.getMethods(credentials);
    check(permission, String);

    if (methods) {
      return !!this.checkPermission(permission, methods);
    }
    return false;
  }

  getRole(credentials){
    if(!credentials){
      return false;
    }
    let meetingId = credentials.meetingId;
    let userId = credentials.requesterUserId;
    let authToken = credentials.requesterToken;

    const user = this.Users.findOne({
      meetingId,
      userId,
    });

    if(!user){
      return false;
    }
    return this.roleExist(this.config, user.user.role);
  }

  checkPermission(permission, permissions) {
    check(permissions, Array);
    check(permission, String);
    
    const isInList = permissions.some((perm)=> perm.indexOf(permission) > -1 );
    return isInList;
  }

  roleExist(acl, userRole) {
    check(acl, Object);
    check(userRole, String);
    return acl[userRole.toLowerCase()];
  }
}
