Meteor.users = new Meteor.Collection('bbb_users');
this.Meetings = new Meteor.Collection('meetings');
this.Chats = new Meteor.Collection('chats');

Meteor.methods({
  authenticate: function(auth) {
    if (!auth.token)
      throw new Meteor.Error(422, "You need a token to authenticate.");

    if (!auth.userId)
      throw new Meteor.Error(422, "You need a userId to authenticate.");

    if (!auth.meetingId)
      throw new Meteor.Error(422, "You need a meetingId to authenticate.");

    var user = {userId: "user1", meetingId: "demo123"};
    //UserSession.set(meetingId + ":" userId, user);
    var userId = Meteor.users.insert(user);
    console.log("User id=[" + userId + "]");
    this.setUserId(userId);
    console.log(this.userId);
    return userId;     
  },
  showUserId: function() {
    throw new Meteor.Error(422, this.userId);
  },
  addToCollection: function(userid, meeting_id) {
    var user = {userId: userid, meetingId: meeting_id};
    var userId = Meteor.users.insert(user);
    console.log("added user id=[" + userId + "] :" + JSON.stringify(user));
  }
});