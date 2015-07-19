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
    unless userIdSelected is null
      if userIdSelected is BBB.getCurrentUser()?.userId
        setInSession "inChatWith", "PUBLIC_CHAT"
      else
        setInSession "inChatWith", userIdSelected
    if isLandscape()
      $("#newMessageInput").focus()
    if isPortrait() or isPortraitMobile()
      toggleUsersList()
      $("#newMessageInput").focus()

  'click .gotUnreadMail': (event) ->
    _this = @
    currentId = getInSession('userId')
    if currentId isnt undefined and currentId is _this.userId
      _id = "PUBLIC_CHAT"
    else 
      _id = _this.userId
    chats = getInSession('chats')
    if chats isnt undefined
      for chat in chats
        if chat.userId is _id
          chat.gotMail = false
          chat.number = 0
          break
      setInSession 'chats', chats

Template.usernameEntry.helpers
  hasGotUnreadMailClass: (userId) ->
    chats = getInSession('chats')
    if chats isnt undefined
      for chat in chats
        if chat.userId is userId and chat.gotMail
          return true
    return false

  getNumberOfUnreadMessages: (userId) ->
    chats = getInSession('chats')
    if chats isnt undefined
      for chat in chats
        if chat.userId is userId and chat.gotMail
          if chat.number > 9
            return "9+"
          else
            return chat.number
    return
