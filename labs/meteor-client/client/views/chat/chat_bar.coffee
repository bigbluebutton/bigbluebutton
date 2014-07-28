Template.messageBar.helpers
  getMessagesInChat: (beforeJoin=true) ->
    friend = chattingWith = Session.get('inChatWith') # the recipient(s) of the messages

    if chattingWith is 'PUBLIC_CHAT' # find all public messages
      if beforeJoin
        Meteor.Chat.find({'message.chat_type': chattingWith, 'message.from_time': {$lt: String(Session.get("joinedAt"))}})
      else
        Meteor.Chat.find({'message.chat_type': chattingWith, 'message.from_time': {$gt: String(Session.get("joinedAt"))}}) 
    else
      me = Session.get "userId"
      Meteor.Chat.find({ # find all messages between current user and recipient
        'message.chat_type': 'PRIVATE_CHAT',
        $or: [{'message.from_userid': me, 'message.to_userid': friend},{'message.from_userid': friend, 'message.to_userid': me}]
      })

  isUserInPrivateChat: -> # true if user is in public chat
    not Session.equals('inChatWith', "PUBLIC_CHAT")

Template.tabButtons.events
  'click .tab': (event) -> ;
    
  'click .publicChatTab': (event) ->
    Session.set 'display_chatPane', true
    Session.set 'inChatWith', 'PUBLIC_CHAT'

  'click .optionsChatTab': (event) ->
    Session.set 'display_chatPane', false

  'click .privateChatTab': (event) ->
    Session.set 'display_chatPane', true
    Session.set 'inChatWith', @userId  
  
  'click .close': (event) -> # user closes private chat
    theName = @name
    console.log theName
    Session.set 'display_chatPane', true
    Session.set 'inChatWith', 'PUBLIC_CHAT'

    origTabs = myTabs.getValue()
    newTabs = []
    for x in origTabs
      if x.name isnt theName
        x.isActive = (x.name is "Public") # set public chat to default
        newTabs.push x

    myTabs.updateValue newTabs
    $(".publicChatTab").addClass('active') # doesn't work when closing the tab that's not currently active :(
    
Template.chatInput.events
  'keypress #newMessageInput': (event) -> # user pressed a button inside the chatbox
    if event.which is 13 # Check for pressing enter to submit message
      chattingWith = Session.get 'inChatWith'

      messageForServer = { # construct message for server
        "message": $("#newMessageInput").val()
        "chat_type": if chattingWith is "PUBLIC_CHAT" then "PUBLIC_CHAT" else "PRIVATE_CHAT"
        "from_userid": Session.get "userId"
        "from_username": getUsersName()
        "from_tz_offset": "240"
        "to_username": if chattingWith is "PUBLIC_CHAT" then "public_chat_username" else chattingWith
        "to_userid": if chattingWith is "PUBLIC_CHAT" then "public_chat_userid" else chattingWith
        "from_lang": "en"
        "from_time": getTime()
        "from_color": "0"
      }
      # console.log "time of join was " + Session.get("joinedAt")
      # console.log 'Sending message to server:'
      # console.log messageForServer
      Meteor.call "sendChatMessagetoServer", Session.get("meetingId"), messageForServer
      $('#newMessageInput').val '' # Clear message box

Template.optionsBar.events
  'click .private-chat-user-entry': (event) -> # clicked a user's name to begin private chat
    currUserId = Session.get "userId"
    duplicate = (x for x in myTabs.get() when x.userId is @userId)

    if duplicate.length<=0 and @userId isnt currUserId
      messageForServer = { 
          "message": "Hey #{@user.name}, its #{getUsersName()} lets start a private chat."
          "chat_type": "PRIVATE_CHAT"
          "from_userid": Session.get "userId"
          "from_username": getUsersName()
          "from_tz_offset": "240"
          "to_username": @user.name
          "to_userid": @userId
          "from_lang": "en"
          "from_time": getTime()
          "from_color": "0"
      }

      # console.log 'Sending private message to server:'
      # console.log messageForServer
      Meteor.call "sendChatMessagetoServer", Session.get("meetingId"), messageForServer

      t = myTabs.getValue()
      t = t.map (x) -> x.isActive = false; return x
      t.push {name: @user.name, isActive: true, class: "privateChatTab", 'userId': @userId }
      myTabs.updateValue t
      $(".optionsChatTab").removeClass('active')

      Session.set 'display_chatPane', true
      Session.set "inChatWith", @userId

Template.tabButtons.helpers
  getChatbarTabs: ->
    console.log myTabs.getValue()
    myTabs.getValue()

  makeTabButton: -> # create tab button for private chat or other such as options
    button = '<li '
    button += 'class="'
    button += 'active ' if @isActive
    button += "#{@class} tab\"><a href=\"#\" data-toggle=\"tab\">#{@name}"
    # if @isActive
    #   button += "(active)"
    # else
    #   button += "(no act)"
    button += '&nbsp;<button class="close closeTab" type="button" >×</button>' if @name isnt 'Public' and @name isnt 'Options'
    button += '</a></li>'
    button

Template.message.helpers
  toClockTime: (epochTime) ->
    local = new Date()
    offset = local.getTimezoneOffset()
    epochTime = epochTime - offset * 60000 # 1 min = 60 s = 60,000 ms
    dateObj = new Date(epochTime)
    hours = dateObj.getUTCHours()
    minutes = dateObj.getUTCMinutes()
    if minutes < 10
      minutes = "0" + minutes
    hours + ":" + minutes

