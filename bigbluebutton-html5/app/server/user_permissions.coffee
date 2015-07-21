
presenter =
  switchSlide: true

  #poll
  subscribePoll: true

# holds the values for whether the moderator user is allowed to perform an action (true)
# or false if not allowed. Some actions have dynamic values depending on the current lock settings
moderator =
  # audio listen only
  joinListenOnly: true
  leaveListenOnly: true

  # join audio with mic cannot be controlled on the server side as it is
  # a client side only functionality

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
  chatPublic: true
  chatPrivate: true

  #poll
  subscribePoll: true


# holds the values for whether the viewer user is allowed to perform an action (true)
# or false if not allowed. Some actions have dynamic values depending on the current lock settings
viewer = (meetingId, userId) ->

  # listen only
  joinListenOnly: true
  leaveListenOnly: true

  # join audio with mic cannot be controlled on the server side as it is
  # a client side only functionality

  # raising/lowering hand
  raiseOwnHand : true
  lowerOwnHand : true

  # muting
  muteSelf : true
  unmuteSelf : !(Meteor.Meetings.findOne({meetingId:meetingId})?.roomLockSettings.disableMic) or
                !(Meteor.Users.findOne({meetingId:meetingId, userId:userId})?.user.locked)

  logoutSelf : true

  #subscribing
  subscribeUsers: true
  subscribeChat: true

  #chat
  chatPublic: !(Meteor.Meetings.findOne({meetingId:meetingId})?.roomLockSettings.disablePubChat) or
                !(Meteor.Users.findOne({meetingId:meetingId, userId:userId})?.user.locked) or
                Meteor.Users.findOne({meetingId:meetingId, userId:userId})?.user.presenter
  chatPrivate: !(Meteor.Meetings.findOne({meetingId:meetingId})?.roomLockSettings.disablePrivChat) or
                !(Meteor.Users.findOne({meetingId:meetingId, userId:userId})?.user.locked) or
                Meteor.Users.findOne({meetingId:meetingId, userId:userId})?.user.presenter
  
  #poll
  subscribePoll: true

# carries out the decision making for actions affecting users. For the list of
# actions and the default value - see 'viewer' and 'moderator' in the beginning of the file
@isAllowedTo = (action, meetingId, userId, authToken) ->

  validated = Meteor.Users.findOne({meetingId:meetingId, userId: userId})?.validated
  Meteor.log.info "in isAllowedTo: action-#{action}, userId=#{userId}, authToken=#{authToken} validated:#{validated}"

  user = Meteor.Users.findOne({meetingId:meetingId, userId: userId})
  Meteor.log.info "user=" + JSON.stringify user
  if user? and authToken is user.authToken # check if the user is who he claims to be
    if user.validated and user.clientType is "HTML5"

      # PRESENTER
      # check presenter specific actions or fallback to regular viewer actions
      if user.user?.presenter
        Meteor.log.info "user permissions presenter case"
        return presenter[action] or viewer(meetingId, userId)[action] or false

      # VIEWER
      else if user.user?.role is 'VIEWER'
        Meteor.log.info "user permissions viewer case"
        return viewer(meetingId, userId)[action] or false

      # MODERATOR
      else if user.user?.role is 'MODERATOR'
        Meteor.log.info "user permissions moderator case"
        return moderator[action] or false
      
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
     "\n..while the authToken was #{user?.authToken}    and the user's object is #{JSON.stringify user}"
    return false
