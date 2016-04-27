Meteor.methods({
  deletePrivateChatMessages(userId, contact_id) {
    // if authorized pass through
    let contact, requester;
    requester = Meteor.Users.findOne({
      userId: userId,
    });
    contact = Meteor.Users.findOne({
      _id: contact_id,
    });
    return deletePrivateChatMessages(requester.userId, contact.userId);
  }
});
