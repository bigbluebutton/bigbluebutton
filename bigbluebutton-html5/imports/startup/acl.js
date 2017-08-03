import { Meteor } from 'meteor/meteor';
import Users from '/imports/api/2.0/users';
import { Acl } from '/imports/api/acl/Acl';

const AclSingleton = new Acl();

Meteor.startup(() => {
  AclSingleton.config = Meteor.settings.public.acl;
  AclSingleton.Users = Users;
});

export default AclSingleton;
