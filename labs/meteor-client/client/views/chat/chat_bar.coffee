Template.messageBar.helpers
  # This method returns all messages for the user. It looks at the session to determine whether the user is in
  #private or public chat. If true is passed, messages returned are from before the user joined. Else, the messages are from after the user joined
  getMessagesInChat: (beforeJoin=true) ->
    friend = chattingWith = getInSession('inChatWith') # the recipient(s) of the messages

    if chattingWith is 'PUBLIC_CHAT' # find all public messages
      if beforeJoin
        Meteor.Chat.find({'message.chat_type': chattingWith, 'message.from_time': {$lt: String(getInSession("joinedAt"))}})
      else
        Meteor.Chat.find({'message.chat_type': chattingWith, 'message.from_time': {$gt: String(getInSession("joinedAt"))}}) 
    else
      me = getInSession("userId")
      Meteor.Chat.find({ # find all messages between current user and recipient
        'message.chat_type': 'PRIVATE_CHAT',
        $or: [{'message.from_userid': me, 'message.to_userid': friend},{'message.from_userid': friend, 'message.to_userid': me}]
      })

  isUserInPrivateChat: -> # true if user is in public chat
    getInSession('inChatWith') isnt "PUBLIC_CHAT"

Template.tabButtons.events
  'click .tab': (event) -> ;
    
  'click .publicChatTab': (event) ->
    setInSession 'display_chatPane', true
    setInSession 'inChatWith', 'PUBLIC_CHAT'

  'click .optionsChatTab': (event) ->
    setInSession 'display_chatPane', false

  'click .privateChatTab': (event) ->
    setInSession 'display_chatPane', true
    setInSession 'inChatWith', @userId  
  
  'click .close': (event) -> # user closes private chat
    theName = @name
    setInSession 'display_chatPane', true
    setInSession 'inChatWith', 'PUBLIC_CHAT'

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
      message = $('#newMessageInput').val() # get the message from the input box
      unless (message?.length > 0 and (/\S/.test(message))) # check the message has content and it is not whitespace
        return # do nothing if invalid message

      chattingWith = getInSession('inChatWith')

      messageForServer = { # construct message for server
        "message": message
        "chat_type": if chattingWith is "PUBLIC_CHAT" then "PUBLIC_CHAT" else "PRIVATE_CHAT"
        "from_userid": getInSession("userId")
        "from_username": getUsersName()
        "from_tz_offset": "240"
        "to_username": if chattingWith is "PUBLIC_CHAT" then "public_chat_username" else chattingWith
        "to_userid": if chattingWith is "PUBLIC_CHAT" then "public_chat_userid" else chattingWith
        "from_lang": "en"
        "from_time": getTime()
        "from_color": "0"
      }
      # console.log 'Sending message to server:'
      # console.log messageForServer
      Meteor.call "sendChatMessagetoServer", getInSession("meetingId"), messageForServer
      $('#newMessageInput').val '' # Clear message box

Template.optionsBar.events
  'click .private-chat-user-entry': (event) -> # clicked a user's name to begin private chat
    currUserId = getInSession("userId")
    duplicate = (x for x in myTabs.get() when x.userId is @userId)

    if duplicate.length<=0 and @userId isnt currUserId
      messageForServer = { 
          "message": "#{getUsersName()} has joined private chat with #{@user.name}."
          "chat_type": "PRIVATE_CHAT"
          "from_userid": getInSession("userId")
          "from_username": getUsersName()
          "from_tz_offset": "240"
          "to_username": @user.name
          "to_userid": @userId
          "from_lang": "en"
          "from_time": getTime()
          "from_color": "0"

      # console.log 'Sending private message to server:'
      # console.log messageForServer
      Meteor.call "sendChatMessagetoServer", getInSession("meetingId"), messageForServer

      t = myTabs.getValue()
      t = t.map (x) -> x.isActive = false; return x
      t.push {name: @user.name, isActive: true, class: "privateChatTab", 'userId': @userId }
      myTabs.updateValue t
      $(".optionsChatTab").removeClass('active')

      setInSession 'display_chatPane', true
      setInSession "inChatWith", @userId

Template.tabButtons.helpers
  getChatbarTabs: ->
    myTabs.getValue()

  makeTabButton: -> # create tab button for private chat or other such as options
    button = '<li '
    button += 'class="'
    button += 'active ' if @isActive
    button += "#{@class} tab\"><a href=\"#\" data-toggle=\"tab\">#{@name}"
    button += '&nbsp;<button class="close closeTab" type="button" >×</button>' if @name isnt 'Public' and @name isnt 'Options'
    button += '</a></li>'
    button

Template.message.rendered = -> # When a message has been added and finished rendering, scroll to the bottom of the chat
  $('#chatScrollWindow').scrollTop($('#chatScrollWindow')[0].scrollHeight)
