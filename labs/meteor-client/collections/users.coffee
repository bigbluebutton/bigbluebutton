Meteor.users = new Meteor.Collection("bbb_users")
@Meetings = new Meteor.Collection("meetings")
@Chats = new Meteor.Collection("chats")

Meteor.methods
  ###
  authenticate: (auth) ->
    throw new Meteor.Error(422, "You need a token to authenticate.")  unless auth.token
    throw new Meteor.Error(422, "You need a userId to authenticate.")  unless auth.userId
    throw new Meteor.Error(422, "You need a meetingId to authenticate.")  unless auth.meetingId
    user =
      userId: "user1"
      meetingId: "demo123"

    #UserSession.set(meetingId + ":" userId, user);
    userId = Meteor.users.insert(user)
    console.log "User id=[" + userId + "]"
    @setUserId userId
    console.log @userId
    userId
  ###

  #showUserId: ->
  #  throw new Meteor.Error(422, @userId)return

  addToCollection: (userid, meeting_id) ->
    user =
      userId: userid
      meetingId: meeting_id

    userId = Meteor.users.insert(user)
    console.log "added user id=[" + userId + "] :" + JSON.stringify(user)