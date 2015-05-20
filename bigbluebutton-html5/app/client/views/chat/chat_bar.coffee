# --------------------------------------------------------------------------------------------------------------------
# If a function's last line is the statement false that represents the function returning false
# A function such as a click handler will continue along with the propogation and default behaivour if not stopped
# Returning false stops propogation/prevents default. You cannot always use the event object to call these methods
# Because most Meteor event handlers set the event object to the exact context of the event which does not
# allow you to simply call these methods.
# --------------------------------------------------------------------------------------------------------------------

@activateBreakLines = (str) ->
  if typeof str is 'string'
    # turn '\r' carriage return characters into '<br/>' break lines
    res = str.replace(new RegExp(CARRIAGE_RETURN, 'g'), BREAK_LINE)
    res

@detectUnreadChat = ->
  #if the current tab is not the same as the tab we just published in
  Meteor.Chat.find({}).observe({
    added: (chatMessage) =>
      findDestinationTab = ->
        if chatMessage.message?.chat_type is "PUBLIC_CHAT"
          "PUBLIC_CHAT"
        else
          chatMessage.message?.from_userid
      Tracker.autorun (comp) ->
        tabsTime = getInSession('tabsRenderedTime')
        if tabsTime? and chatMessage.message.from_userid isnt "SYSTEM_MESSAGE" and chatMessage.message.from_time - tabsTime > 0
          populateChatTabs(chatMessage) # check if we need to open a new tab
          destinationTab = findDestinationTab()
          if destinationTab isnt getInSession "inChatWith"
            setInSession 'chatTabs', getInSession('chatTabs').map((tab) ->
              tab.gotMail = true if tab.userId is destinationTab
              tab
            )
        comp.stop()
    })

# This method returns all messages for the user. It looks at the session to determine whether the user is in
# private or public chat. If true is passed, messages returned are from before the user joined. Else, the messages are from after the user joined
@getFormattedMessagesForChat = ->
  chattingWith = getInSession('inChatWith')
  if chattingWith is 'PUBLIC_CHAT' # find all public and system messages
    return Meteor.Chat.find({'message.chat_type': $in: ["SYSTEM_MESSAGE","PUBLIC_CHAT"]},{sort: {'message.from_time': 1}}).fetch()
  else
    return Meteor.Chat.find({'message.chat_type': 'PRIVATE_CHAT', $or: [{'message.to_userid': chattingWith},{'message.from_userid': chattingWith}]}).fetch()

# Scrolls the message container to the bottom. The number of pixels to scroll down is the height of the container
Handlebars.registerHelper "autoscroll", ->
  $('#chatbody').scrollTop($('#chatbody')[0]?.scrollHeight)
  false

# true if the lock settings limit public chat and the current user is locked
Handlebars.registerHelper "publicChatDisabled", ->
  userIsLocked = Meteor.Users.findOne({userId:getInSession 'userId'})?.user.locked
  publicChatIsDisabled = Meteor.Meetings.findOne({})?.roomLockSettings.disablePubChat
  presenter = Meteor.Users.findOne({userId:getInSession 'userId'})?.user.presenter
  return userIsLocked and publicChatIsDisabled and !presenter

# true if the lock settings limit private chat and the current user is locked
Handlebars.registerHelper "privateChatDisabled", ->
  userIsLocked = Meteor.Users.findOne({userId:getInSession 'userId'})?.user.locked
  privateChatIsDisabled = Meteor.Meetings.findOne({})?.roomLockSettings.disablePrivChat
  presenter = Meteor.Users.findOne({userId:getInSession 'userId'})?.user.presenter
  return userIsLocked and privateChatIsDisabled and !presenter

# return whether the user's chat pane is open in Private chat
Handlebars.registerHelper "inPrivateChat", ->
  return (getInSession 'inChatWith') isnt 'PUBLIC_CHAT'

@sendMessage = ->
  message = linkify $('#newMessageInput').val() # get the message from the input box
  unless (message?.length > 0 and (/\S/.test(message))) # check the message has content and it is not whitespace
    return # do nothing if invalid message

  color = "0x000000" #"0x#{getInSession("messageColor")}"
  if (chattingWith = getInSession('inChatWith')) isnt "PUBLIC_CHAT"
    toUsername = Meteor.Users.findOne(userId: chattingWith)?.user.name
    BBB.sendPrivateChatMessage(color, "en", message, chattingWith, toUsername)
  else
    BBB.sendPublicChatMessage(color, "en", message)

  $('#newMessageInput').val '' # Clear message box

Template.chatbar.helpers
  getCombinedMessagesForChat: ->
    msgs = getFormattedMessagesForChat()
    len = msgs?.length # get length of messages
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
              # insert a '\r' carriage return character between messages to put them on a new line
              msgs[i].message.message += "#{CARRIAGE_RETURN}#{msgs[j].message.message}" # Combine the messages
              msgs.splice(j,1) # Delete the message from the collection
              deleted = true
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

  userExists: ->
    if getInSession('inChatWith') is "PUBLIC_CHAT"
      return true
    else
      return Meteor.Users.findOne({userId: getInSession('inChatWith')})?

# When chatbar gets rendered, launch the auto-check for unread chat
Template.chatbar.rendered = -> detectUnreadChat()

# When message gets rendered, scroll to the bottom
Template.message.rendered = ->
  $('#chatbody').scrollTop($('#chatbody')[0]?.scrollHeight)
  false

Template.chatInput.events
  'click #sendMessageButton': (event) ->
    $('#sendMessageButton').blur()
    sendMessage()

  'keypress #newMessageInput': (event) -> # user pressed a button inside the chatbox
    key = (if event.charCode then event.charCode else (if event.keyCode then event.keyCode else 0))

    if event.shiftKey and (key is 13)
      event.preventDefault()
      # append a '\r' carriage return character to the input box dropping the cursor to a new line
      document.getElementById("newMessageInput").value += CARRIAGE_RETURN # Change newline character
      return

    if key is 13 # Check for pressing enter to submit message
      event.preventDefault()
      sendMessage()
      $('#newMessageInput').val("")
      return false

Template.message.helpers
  sanitizeAndFormat: (str) ->
    if typeof str is 'string'
      # First, replace replace all tags with the ascii equivalent (excluding those involved in anchor tags)
      res = str.replace(/&/g, '&amp;').replace(/<(?![au\/])/g, '&lt;').replace(/\/([^au])>/g, '$1&gt;').replace(/([^=])"(?!>)/g, '$1&quot;');
      res = toClickable res
      res = activateBreakLines res

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

Template.optionsFontSize.events
  "click #decreaseFontSize": (event) ->
    if getInSession("messageFontSize") is 8 # min
      $('#decreaseFontSize').disabled = true
      $('#decreaseFontSize').removeClass('icon fi-minus')
      $('#decreaseFontSize').html('MIN')
    else
      setInSession "messageFontSize", getInSession("messageFontSize") - 2
      if $('#increaseFontSize').html() is 'MAX'
        $('#increaseFontSize').html('')
        $('#increaseFontSize').addClass('icon fi-plus')

  "click #increaseFontSize": (event) ->
    if getInSession("messageFontSize") is 40 # max
      $('#increaseFontSize').disabled = true
      $('#increaseFontSize').removeClass('icon fi-plus')
      $('#increaseFontSize').html('MAX')
    else
      setInSession "messageFontSize", getInSession("messageFontSize") + 2
      if $('#decreaseFontSize').html() is 'MIN'
        $('#decreaseFontSize').html('')
        $('#decreaseFontSize').addClass('icon fi-minus')

# make links received from Flash client clickable in HTML
@toClickable = (str) ->
  if typeof str is 'string'
    res = str.replace /<a href='event:/gim, "<a target='_blank' href='"
    res = res.replace /<a href="event:/gim, '<a target="_blank" href="'
