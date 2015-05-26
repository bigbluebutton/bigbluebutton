Template.displayUserIcons.events
  'click .muteIcon': (event) ->
    toggleMic @

  'click .raisedHandIcon': (event) ->
    # the function to call 'userLowerHand'
    # the meeting id
    # the _id of the person whose land is to be lowered
    # the userId of the person who is lowering the hand
    BBB.lowerHand(getInSession("meetingId"), @userId, getInSession("userId"), getInSession("authToken"))

Template.displayUserIcons.helpers
  userLockedIconApplicable: (userId) ->
    # the lock settings affect the user (and requiire a lock icon) if
    # the user is set to be locked and there is a relevant lock in place
    locked = BBB.getUser(userId)?.user.locked
    settings = Meteor.Meetings.findOne()?.roomLockSettings
    lockInAction = settings.disablePrivChat or
                    settings.disableCam or
                    settings.disableMic or
                    settings.lockedLayout or
                    settings.disablePubChat
    return locked and lockInAction

# Opens a private chat tab when a username from the userlist is clicked 
Template.usernameEntry.events
  'click .usernameEntry': (event) ->
    userIdSelected = @.userId
    unless userIdSelected is null or userIdSelected is BBB.getCurrentUser()?.userId
      setInSession "inChatWith", userIdSelected