import { check } from 'meteor/check';

export class Acl {

  constructor(aclConfig, Users) {
    this.Users = Users;
    this.aclConfig = aclConfig;
  }

  subscribe(channel,credentials){
    check(channel, String);
    console.log("Channell",channel);
    console.log("credentials",credentials);

    let subscriptions = this.getSubscriptions(credentials);

    console.log("subscriptions",subscriptions);

    if (subscriptions) {
      return !!this.checkPermission(channel, subscriptions);
    }
    return false;
  }

  getSubscriptions(credentials){
    let role = this.getRole(credentials);

    if(!role.subscribe){
      return [];
    }
    return role.subscriptions;
  }

  checkSubscription(channel, subscriptions) {
    check(channel, String);
    
    const isInList = subscriptions.some((perm)=> perm.indexOf(permission) > -1 );

    return isInList;
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

    const meetingId = credentials.meetingId;
    const userId = credentials.requesterUserId;
    const authToken = credentials.requesterToken;

    const user = this.Users.findOne({
      meetingId,
      userId,
    });

    if(!user){
      console.log("Usuario vazio");
      return false;
    }
    return this.roleExist(this.aclConfig, user.user.role);
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
