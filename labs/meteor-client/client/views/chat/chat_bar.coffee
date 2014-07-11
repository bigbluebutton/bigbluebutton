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
    Session.get('inChatWith') isnt "PUBLIC_CHAT" 

# Must be be called when template is finished rendering or will not work
Template.messageBar.rendered = -> # Scroll down the messages box the amount of its height, which places it at the bottom
    height = $('#chatScrollWindow').height()
    $('#chatScrollWindow').scrollTop(height)  

Template.tabButtons.events
  'click .tab': (event) ->
    # $('.tab').removeClass('active')
    

  'click .publicChatTab': (event) ->
    Session.set 'display_chatPane', true
    Session.set 'inChatWith', 'PUBLIC_CHAT'
    Meteor.call 'invalidateAllTabs', Session.get('userId'), false
    toUpdate = Meteor.ChatTabs.findOne({name:"Public"})
    Meteor.ChatTabs.update({_id: toUpdate._id}, {$set: 'isActive':true})

  'click .optionsChatTab': (event) ->
    Session.set 'display_chatPane', false
    Meteor.call 'invalidateAllTabs', Session.get('userId'), false
    toUpdate = Meteor.ChatTabs.findOne({name:"Options"})
    Meteor.ChatTabs.update({_id: toUpdate._id}, {$set: 'isActive':true})

  'click .privateChatTab': (event) ->
    Session.set 'display_chatPane', true
    Session.set 'inChatWith', @userId
    Meteor.call 'invalidateAllTabs', Session.get('userId'), false
    console.log @name
    toUpdate = Meteor.ChatTabs.findOne({name:@name})
    if toUpdate? then Meteor.ChatTabs.update({_id: toUpdate._id}, {$set: 'isActive':true})

  'click .close': (event) -> # user closes private chat
    toRemove = Meteor.ChatTabs.findOne({name:@name})
    if toRemove? then Meteor.ChatTabs.remove({_id: toRemove._id}) # should probably delete chat history here too?
    
    Session.set 'display_chatPane', true
    Session.set 'inChatWith', 'PUBLIC_CHAT'
    Meteor.call 'invalidateAllTabs', Session.get('userId'), false
    toUpdate = Meteor.ChatTabs.findOne({name:"Public"})
    Meteor.ChatTabs.update({_id: toUpdate._id}, {$set: 'isActive':true})
    event.stopPropogation()
    

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
    duplicate = Meteor.ChatTabs.findOne({'belongsTo':Session.get("userId"), 'userId': @userId})

    if not duplicate and @userId isnt currUserId
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
      Meteor.call "invalidateAllTabs", currUserId, false
      # Give tab to us
      Meteor.ChatTabs.insert({belongsTo: currUserId, name: @user.name, isActive: true, class: "privateChatTab", 'userId': @userId})
      # Give tab to recipient to notify them
      Meteor.ChatTabs.insert({belongsTo: @userId, name: getUsersName(), isActive: false, class: "privateChatTab", 'userId': currUserId})
      Session.set 'display_chatPane', true
      Session.set "inChatWith", @userId
      # $('.tab').removeClass('active')
      # Todo:
      #   just need a way to make the newly created tab active
      #   don't know how to do that right here since it doesn't get created here
      #   once that's handled, private chat is essentially done
      # $("#tabButtonContainer").append("<li>fsdfdsf| </li>")




Template.tabButtons.helpers
  getChatbarTabs: ->
    console.log "displaying tabs"
    t = Meteor.ChatTabs.find({}).fetch()
    # console.log JSON.stringify t
    t

  makeTabButton: -> # create tab button for private chat or other such as options
    console.log "#{@name} is " + if @isActive then "active" else "not active"
    button = '<li '
    button += 'class="'
    button += 'active ' if @isActive
    button += "#{@class} tab\"><a href=\"#\" data-toggle=\"tab\">#{@name}"
    button += '&nbsp;<button class="close closeTab" type="button" >×</button>' if @name isnt 'Public' and @name isnt 'Options'
    button += '</a></li>'
    console.log "and here it is the button"
    console.log button
    button

