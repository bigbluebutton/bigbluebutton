Meteor.Users = new Meteor.Collection("bbb_users")
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
    userId = Meteor.Users.insert(user)
    console.log "User id=[" + userId + "]"
    @setUserId userId
    console.log @userId
    userId
  ###

  #showUserId: ->
  #  throw new Meteor.Error(422, @userId)return

  addToCollection: (userId, meetingId) ->

    #check if the user is already in the meeting
    unless Meteor.Users.findOne({userId:userId, meetingId: meetingId})?
      user =
        userId: userId
        meetingId: meetingId
      console.log "before:" + Meteor.Users.find().count()
      userId = Meteor.Users.insert(user)
      console.log "after:" + Meteor.Users.find().count()
      console.log "added user id=[" + userId + "] :" + JSON.stringify(user)
    else
      console.log "redundant entry, do not add to Meteor.Users - " + userId + ":" + meetingId

  removeFromCollection: (meetingId, userId) ->
    console.log "----removing " + userId + "from " + meetingId
    if meetingId? and userId?
      console.log "before:" + Meteor.Users.find().count()
      id = Meteor.Users.findOne({meetingId: meetingId, userId: userId})
      Meteor.Users.remove(_id: id._id)
      console.log "after:" + Meteor.Users.find().count()
    else
      console.log "at least one of {userId, meetingId} was missing"
