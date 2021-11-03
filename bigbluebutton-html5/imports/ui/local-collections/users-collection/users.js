import Users from '/imports/api/users';
import AbstractCollection from '/imports/ui/local-collections/abstract-collection/abstract-collection';

const localUsers = new Mongo.Collection('local-users', { connection: null });

export const localUsersSync = new AbstractCollection(Users, localUsers);

export default localUsers;
