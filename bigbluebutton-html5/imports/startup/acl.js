import { Meteor } from 'meteor/meteor';
import Users from '/imports/api/users';
import { Acl } from '/imports/api/acl/Acl';
let AclSingleton = new Acl();

Meteor.startup(() => {
  AclSingleton.aclConfig = Meteor.settings.public.acl;
  AclSingleton.Users =  Users;
});

export default AclSingleton;

export let acl = AclSingleton;
