define [
  'jquery',
  'underscore',
  'backbone',
  'globals',
  'cs!models/chat',
  'text!templates/session_chat.html',
  'text!templates/chat_user_list_item.html',
  'text!templates/chat_message.html',
  'text!templates/chat_private_tab.html',
  'text!templates/chat_private_box.html'
], ($, _, Backbone, globals,ChatModel,sessionChatTemplate, chatUserListItem,
  chatMessageTemplate, privateChatTab, privateChatBox) ->

  # The chat panel in a session
  # The contents are rendered by SessionView, this class is Used to
  # manage the events in the chat.
  SessionChatView = Backbone.View.extend
    model: new ChatModel()

    events:
      "click button#chat-send-btn": "_sendMessage"
      "keyup #chat-input-box": "_inputKeyPressed"
      "click .chat-user-list-item":"_startPrivateChat"
      "click #chat-general-btn":"_selectPublicChat"
      "click .chat-private-btn":"_selectPrivateChat"

    initialize: ->
      # save a few IDs for easier access
      @inputBoxID = "#chat-input-box"
      @publicBoxID = "#chat-public-box"
      @userListID = "#chat-user-list"
      @privateTabsIDs = "#chat-private-tabs"
      @messageBoxesContainerID = "#chat-messages"

      @model.start()

      # Bind to the event triggered when the client connects to the server
      if globals.connection.isConnected()
        @_registerEvents()
        @_addWelcomeMessage()

      else
        globals.events.on "connection:connected", =>
          @_registerEvents()
          @_addWelcomeMessage()

    render: ->
      compiledTemplate = _.template(sessionChatTemplate)
      @$el.html compiledTemplate

    # Registers listeners for events in the application socket.
    _registerEvents: ->

      globals.events.on "chat:msg", (name, msg) =>
        @_addChatMessage(name, msg)
        @_scrollToBottom()

      globals.events.on "chat:all_messages", (messages) =>
        if messages?
          for msgBlock in messages
            @_addChatMessage(msgBlock.from_username, msgBlock.message)
            #TODO check if public or private message, etc...
        @_scrollToBottom()

      globals.events.on "users:user_left", (userid) =>
        @_removeUserFromChatList(userid)

      globals.events.on "users:user_join", (userid, username) =>
        console.log "session_chat - user_join for user:#{username}"
        @_addUserToChatList(userid, username)

      globals.events.on "users:loadUsers", (users) =>
        console.log ' globals.events.on "users:loadUsers"' + JSON.stringify(users)
        #@$(@userListID).clear()
        ### for user in users
          console.log "user: " + JSON.stringify(user)
          #@_addUserToChatList(user.id, user.name)
          globals.events.trigger("users:user_join", user.id, user.name)###

      # TODO: for now these messages are only being shown in the chat, maybe
      #       they should have their own view and do more stuff
      #       (e.g. disable the interface when disconnected)
      globals.events.on "connection:connected", =>
        @_addChatMessage("system", "Connected to the server.")
      globals.events.on "connection:disconnected", =>
        @_addChatMessage("system", "Disconnected form the server.")
      globals.events.on "connection:reconnect", =>
        @_addChatMessage("system", "Reconnected!")
      globals.events.on "connection:reconnecting", =>
        @_addChatMessage("system", "Reconnecting...")
      globals.events.on "connection:reconnect_failed", =>
        @_addChatMessage("system", "Reconnect failed!")

    # Add a message to the screen and scroll the chat area to bottom
    _addChatMessage: (username, message) ->
      data =
        username: username
        message: message
      compiledTemplate = _.template(chatMessageTemplate, data)
      @$(@publicBoxID).append compiledTemplate
      @_scrollToBottom()

    # Scrolls the chat area to bottom to show the last messages
    _scrollToBottom: ->
      #$msgBox = @$(@publicBoxID)
      #$msgBox.prop({ scrollTop: $msgBox.prop("scrollHeight") })

      #got scroll to bottom working using div element ID's (if they change then this line needs to change)
      console.log("scrollToBottom called");
      $("#chat-messages").scrollTop( $("#chat-public-box").height() )

    # A key was pressed in the input box
    _inputKeyPressed: (e) ->
      # Send message when the enter key is pressed
      @_sendMessage() if e.keyCode is 13

    # Send a chat message
    _sendMessage: ->
      $chatInput = @$(@inputBoxID)
      msg = $chatInput.val()
      if msg? and msg.trim() isnt ""
        globals.connection.emitMsg msg
        $chatInput.val("")
      $chatInput.focus()

    # Adds a user to the list of users in the chat, used to start private chats
    # @param userid [string] the ID of the user
    # @param userid [string] the name of the user
    _addUserToChatList: (userid, username) ->
      # only add the new element if it doesn't exist yet
      if $("#chat-user-#{userid}").length is 0
        data =
          userid: userid
          username: username
        compiledTemplate = _.template(chatUserListItem, data)
        @$(@userListID).append compiledTemplate

    # Removes a user from the list of users in the chat
    # @param userid [string] the ID of the user
    _removeUserFromChatList: (userid) ->
      $("#chat-user-#{userid}").remove()

    # When a user clicks to start a private chat with a user
    # @param e [event] the click event that generated this call
    _startPrivateChat: (e) ->
      $target = $(e.target)
      userid = $target.attr("data-userid")
      params =
        username: $target.attr("data-username")
        userid: userid

      # add a new tab and chat box for the private chat, only if needed
      unless $("#chat-private-#{userid}").length > 0
        tab =_.template(privateChatTab, params)
        $(@privateTabsIDs).prepend(tab)
        chatBox = _.template(privateChatBox, params)
        $(@messageBoxesContainerID).append(chatBox)

      @_selectPrivateChat(e)

    # Selects the private chat
    _selectPublicChat: ->
      # set all private tabs and chat boxes as inactive
      @_inactivatePrivateChats()

      # set the public chat button and box as active
      $("#chat-general-btn").addClass("active")
      $(@publicBoxID).addClass("active")

      # tell the parent element that the public chat is active
      @$el.addClass('public-chat-on')
      @$el.removeClass('private-chat-on')

    # Selects a private chat
    # @param e [event] the click event that generated this call
    _selectPrivateChat: (e) ->
      $target = $(e.target)
      userid = $target.attr("data-userid")

      # set all other tabs and chat boxes as inactive
      @_inactivatePrivateChats()
      @_inactivatePublicChat()

      # set the current private chat tab and box as active and public as inactive
      $("#chat-private-btn-#{userid}").addClass("active")
      $("#chat-private-#{userid}").addClass("active")
      $(@publicBoxID).removeClass("active")

      # tell the parent element that the private chat is active
      @$el.removeClass('public-chat-on')
      @$el.addClass('private-chat-on')

    # Inactivates all private chat tabs/buttons
    _inactivatePrivateChats: ->
      $(".chat-private-btn").removeClass("active")
      $(".chat-private-box").removeClass("active")

    # Inactivates the public chat tab/button
    _inactivatePublicChat: ->
      $("#chat-general-btn").removeClass("active")

    # Adds a default welcome message to the chat
    _addWelcomeMessage: ->
      msg = "You are now connected to the meeting '#{globals.meetingName}'"
      @_addChatMessage("System", msg)

  SessionChatView
