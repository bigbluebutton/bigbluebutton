import { Users } from '/imports/api/users/usersCollection';

Meteor.methods({
  deletePrivateChatMessages(userId, contact_id) { //TODO is this used?!
    // if authorized pass through
    let contact, requester;
    requester = Users.findOne({
      userId: userId,
    });
    contact = Users.findOne({
      _id: contact_id,
    });
    return deletePrivateChatMessages(requester.userId, contact.userId);
  },
});
