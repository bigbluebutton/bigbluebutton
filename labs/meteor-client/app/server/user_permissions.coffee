
moderator = null
presenter = null
viewer =
  # raising/lowering hand
  raiseOwnHand : true
  lowerOwnHand : true

  # muting
  muteSelf : true
  unmuteSelf : true

  logoutSelf : true

  #subscribing
  subscribeUsers: true
  subscribeChat: true

  #chat
  chatPublic: true #should make this dynamically modifiable later on
  chatPrivate: true #should make this dynamically modifiable later on

@isAllowedTo = (action, meetingId, userId, authToken) ->
  # Disclaimer:the current version of the HTML5 client represents only VIEWER users

  validated = Meteor.Users.findOne({meetingId:meetingId, userId: userId})?.validated
  Meteor.log.info "in isAllowedTo: action-#{action}, userId=#{userId}, authToken=#{authToken} validated:#{validated}"

  user = Meteor.Users.findOne({meetingId:meetingId, userId: userId})

  if user? and authToken is user.authToken # check if the user is who he claims to be
    if user.validated and user.clientType is "HTML5"
      if user.user?.role is 'VIEWER' or user.user?.role is undefined
        return viewer[action] or false
      else
        Meteor.log.warn "UNSUCCESSFULL ATTEMPT FROM userid=#{userId} to perform:#{action}"
        return false
    else
      # user was not validated
      if action is "logoutSelf"
        # on unsuccessful sign-in
        Meteor.log.warn "a user was successfully removed from the meeting following an unsuccessful login"
        return true
      return false

  else
    Meteor.log.error "in meetingId=#{meetingId} userId=#{userId} tried to perform #{action} without permission" +
     "\n..while the authToken was #{user.authToken}    and the user's object is #{JSON.stringify user}"
    return false
