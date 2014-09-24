@sendMessage = ->
  message = linkify $('#newMessageInput').val() # get the message from the input box
  unless (message?.length > 0 and (/\S/.test(message))) # check the message has content and it is not whitespace
    return # do nothing if invalid message

  chattingWith = getInSession('inChatWith')

  if chattingWith isnt "PUBLIC_CHAT"
    dest = Meteor.Users.findOne("userId": chattingWith)

  messageForServer = { # construct message for server
    "message": message
    "chat_type": if chattingWith is "PUBLIC_CHAT" then "PUBLIC_CHAT" else "PRIVATE_CHAT"
    "from_userid": getInSession("userId")
    "from_username": getUsersName()
    "from_tz_offset": "240"
    "to_username": if chattingWith is "PUBLIC_CHAT" then "public_chat_username" else dest.user.name
    "to_userid": if chattingWith is "PUBLIC_CHAT" then "public_chat_userid" else chattingWith
    "from_lang": "en"
    "from_time": getTime()
    "from_color": "0x000000"
    # "from_color": "0x#{getInSession("messageColor")}"
  }

  Meteor.call "sendChatMessagetoServer", getInSession("meetingId"), messageForServer
  $('#newMessageInput').val '' # Clear message box

Template.chatInput.events
  'click #sendMessageButton': (event) ->
    sendMessage()

  'keypress #newMessageInput': (event) -> # user pressed a button inside the chatbox
    if event.shiftKey and event.which is 13
      $("#newMessageInput").append("\n")
      return
    
    if event.which is 13 # Check for pressing enter to submit message
      sendMessage()
      $('#newMessageInput').val("")
      return false

Template.chatInput.rendered  = ->
   $('input[rel=tooltip]').tooltip()
   $('button[rel=tooltip]').tooltip()

Template.chatbar.helpers
  getChatGreeting: ->
    greeting = "Welcome to #{getMeetingName()}!\r\r
    For help on using BigBlueButton see these (short) <a href='http://www.bigbluebutton.org/videos/' target='_blank'>tutorial videos</a>.\r\r
    To join the audio bridge click the headset icon (upper-left hand corner).  Use a headset to avoid causing background noise for others.\r\r\r
    This server is running BigBlueButton #{getInSession 'bbbServerVersion'}."

  # This method returns all messages for the user. It looks at the session to determine whether the user is in
  #private or public chat. If true is passed, messages returned are from before the user joined. Else, the messages are from after the user joined
  getFormattedMessagesForChat: ->
    friend = chattingWith = getInSession('inChatWith') # the recipient(s) of the messages
    after = before = greeting = []

    if chattingWith is 'PUBLIC_CHAT' # find all public messages
      before = Meteor.Chat.find({'message.chat_type': chattingWith, 'message.from_time': {$lt: String(getTimeOfJoining())}}).fetch()
      after = Meteor.Chat.find({'message.chat_type': chattingWith, 'message.from_time': {$gt: String(getTimeOfJoining())}}).fetch()

      greeting = [
        'message':
          'message': Template.chatbar.getChatGreeting(),
          'from_username': 'System',
          'from_time': getTimeOfJoining()
          'from_color': '0x3399FF' # A nice blue in hex
      ]
    else
      me = getInSession("userId")
      after = Meteor.Chat.find({ # find all messages between current user and recipient
      'message.chat_type': 'PRIVATE_CHAT',
      $or: [{'message.from_userid': me, 'message.to_userid': friend},{'message.from_userid': friend, 'message.to_userid': me}]
      }).fetch()

    messages = (before.concat greeting).concat after

  getCombinedMessagesForChat: ->
    msgs = Template.chatbar.getFormattedMessagesForChat()
    len = msgs.length # get length of messages
    i = 0
    while i < len # Must be a do while, for loop compiles and stores the length of array which can change inside the loop!
      if msgs[i].message.from_userid isnt 'System' # skip system messages
        j = i+1 # Start looking at messages right after the current one

        while j < len
          deleted = false
          if msgs[j].message.from_userid isnt 'System' # Ignore system messages
            # Check if the time discrepancy between the two messages exceeds window for grouping
            if (parseFloat(msgs[j].message.from_time)-parseFloat(msgs[i].message.from_time)) >= 60000 # 60 seconds/1 minute
              break # Messages are too far between, so them seperated and stop joining here

            if msgs[i].message.from_userid is msgs[j].message.from_userid # Both messages are from the same user
              msgs[i].message.message += "\\n#{msgs[j].message.message}" # Combine the messages
              msgs.splice(j,1) # Delete the message from the collection
              deleted=true
            else break # Messages are from different people, move on
            #
          else break # This is the break point in the chat, don't merge
          #
          len = msgs.length
          ++j if not deleted
      #
      ++i
      len = msgs.length

    msgs

  markNewAsUnread: ->
    #if the current tab is not the same as the tab we just published in
    Meteor.Chat.find({}).observe({
      added: (chatMessage) =>
        destinationTab = ->
          if chatMessage.message?.chat_type is "PUBLIC_CHAT"
            "PUBLIC_CHAT"
          else
            chatMessage.message?.from_userid
        console.log "destination=" + destinationTab()

        if destinationTab() isnt getInSession "inChatWith"
          console.log "there should be flashing on:" + destinationTab()

        #currentTab = document.getElementsByClassName("active")[0].getElementsByTagName("a")[0].id #TODO how can I simplify this?!?
      })


# When chatbar gets rendered, scroll to the bottom
Template.chatbar.rendered = ->
  Template.chatbar.markNewAsUnread()
  $('#chatbody').scrollTop($('#chatbody')[0]?.scrollHeight)
  false
# Scrolls the message container to the bottom. The number of pixels to scroll down is the height of the container
Handlebars.registerHelper "autoscroll", ->
  $('#chatbody').scrollTop($('#chatbody')[0]?.scrollHeight)
  false

Template.optionsBar.events
  'click .private-chat-user-entry': (event) -> # clicked a user's name to begin private chat
    setInSession 'display_chatPane', true
    setInSession "inChatWith", @userId
    me = getInSession("userId")

    if Meteor.Chat.find({'message.chat_type': 'PRIVATE_CHAT', $or: [{'message.from_userid': me, 'message.to_userid': @userId},{'message.from_userid': @userId, 'message.to_userid': me}]}).fetch().length is 0
      messageForServer =
        "message": "#{getUsersName()} has joined private chat with #{@user.name}."
        "chat_type": "PRIVATE_CHAT"
        "from_userid": me
        "from_username": getUsersName()
        "from_tz_offset": "240"
        "to_username": @user.name
        "to_userid": @userId
        "from_lang": "en"
        "from_time": getTime()
        "from_color": "0"
      Meteor.call "sendChatMessagetoServer", getInSession("meetingId"), messageForServer

Template.optionsBar.rendered = ->
  $('div[rel=tooltip]').tooltip()

Template.optionsFontSize.events
  "click .fontSizeSelector": (event) ->
    selectedFontSize = parseInt(event.target.id)
    if selectedFontSize
      setInSession "messageFontSize", selectedFontSize
    else setInSession "messageFontSize", 12

Template.tabButtons.events
  'click .close': (event) -> # user closes private chat
    setInSession 'inChatWith', 'PUBLIC_CHAT'
    setInSession 'display_chatPane', true
    Meteor.call("deletePrivateChatMessages", getInSession("userId"), @userId)
    return false # stops propogation/prevents default

  'click .optionsChatTab': (event) ->
    setInSession 'display_chatPane', false

  'click .privateChatTab': (event) ->
    setInSession 'display_chatPane', true
    console.log ".private"

  'click .publicChatTab': (event) ->
    setInSession 'display_chatPane', true

  'click .tab': (event) -> 
    setInSession "inChatWith", @userId
  
Template.tabButtons.helpers
  getChatbarTabs: ->
    # Finds the names of all people the current user is in a private conversation with
    #  Removes yourself and duplicates if they exist
    getPrivateChatees = ->
      me = getInSession("userId")
      users = Meteor.Users.find().fetch()
      people = Meteor.Chat.find({$or: [{'message.from_userid': me, 'message.chat_type': 'PRIVATE_CHAT'},{'message.to_userid': me, 'message.chat_type': 'PRIVATE_CHAT'}] }).fetch()
      formattedUsers = null
      formattedUsers = (u for u in users when (do -> 
        return false if u.userId is me
        found = false
        for chatter in people
          if u.userId is chatter.message.to_userid or u.userId is chatter.message.from_userid
            found = true
        found
        )
      )
      if formattedUsers? then formattedUsers else []


    # Creates a 'tab' object for each person in chat with
    # adds public and options tabs to the menu
    privTabs = getPrivateChatees().map (u, index) ->
        newObj = {
          userId: u.userId
          name: u.user.name
          gotMail: false
          class: "privateChatTab"
        }
    tabs = [
      {userId: "PUBLIC_CHAT", name: "Public", gotMail: false, class: "publicChatTab"},
      {userId: "OPTIONS", name: "Options", gotMail: false, class: "optionsChatTab"}
    ].concat privTabs
    tabs

  makeTabButton: -> # create tab button for private chat or other such as options
    safeClass = @class.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    safeName = @name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    button = '<li '
    button += 'class="'
    button += 'active ' if getInSession("inChatWith") is @userId
    button += "tab #{safeClass}\"><a href=\"#\" data-toggle=\"tab\" id=\"#{safeName}\" \>#{safeName}"
    button += '&nbsp;<button class="close closeTab" type="button" >×</button>' if @class is 'privateChatTab'
    button += '</a></li>'
    button

Template.message.helpers
  activateBreakLines: (str) ->
    res = str.replace /\\n/gim, '<br/>'
    res = res.replace /\r/gim, '<br/>'
  
  # make links received from Flash client clickable in HTML
  toClickable: (str) ->
    res = str.replace /<a href='event:/gim, "<a target='_blank' href='"
    res = res.replace /<a href="event:/gim, '<a target="_blank" href="'

  toClockTime: (epochTime) ->
    if epochTime is null
      return ""
    local = new Date()
    offset = local.getTimezoneOffset()
    epochTime = epochTime - offset * 60000 # 1 min = 60 s = 60,000 ms
    dateObj = new Date(epochTime)
    hours = dateObj.getUTCHours()
    minutes = dateObj.getUTCMinutes()
    if minutes < 10
      minutes = "0" + minutes
    hours + ":" + minutes

  sanitizeAndFormat: (str) ->
    # First, replace replace all tags with the ascii equivalent (excluding those involved in anchor tags)
    res = str.replace(/&/g, '&amp;').replace(/<(?![au\/])/g, '&lt;').replace(/\/([^au])>/g, '$1&gt;').replace(/([^=])"(?!>)/g, '$1&quot;');
    
    res = Template.message.toClickable res
    res = Template.message.activateBreakLines res
