import guestUsers from '/imports/api/guest-users';
import AbstractCollection from '/imports/ui/local-collections/abstract-collection/abstract-collection';

const localGuestUsers = new Mongo.Collection('local-guest-users', { connection: null });

export const localGuestUsersSync = new AbstractCollection(guestUsers, localGuestUsers);

export default localGuestUsers;
