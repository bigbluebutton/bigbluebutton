define [
  'jquery',
  'underscore',
  'backbone',
  'globals',
  'cs!models/chat',
  'text!templates/session_chat.html',
  'text!templates/chatlist.html',
  'text!templates/chat_message.html',
  'text!templates/privateChatButton.html',
  'text!templates/privateChatBox.html'
], ($, _, Backbone, globals,ChatModel,sessionChatTemplate, chatList,chatMessageTemplate,privateChatButton,privateChatBox) ->

  # The chat panel in a session
  # The contents are rendered by SessionView, this class is Used to
  # manage the events in the chat.
  SessionChatView = Backbone.View.extend
    model: new ChatModel()

    events:
      "click button#chat-send": "_sendMessage"
      "keyup #chat-input-box": "_inputKeyPressed"
      "click #privateChat": "_toggleUserList"
      "click p.clickable":"_chooseUser"
      "click i.icon-remove-sign":"_closePrivateChat"
      "click #publicChat":"_togglePublicChat"
      "click #chat-options-bar button":"_hideAllOtherChatBox"
      "click #nxt":"_scrollUptButton"
      "click #prv":"_scrollDowntButton"

    initialize: ->
      @chatInputID = "#chat-input-box"
      @msgBoxID = "#chat-messages"
      @chatListID = "#all-users-list"
      @model.start()

      # Bind to the event triggered when the client connects to the server
      if globals.connection.isConnected()
        @_registerEvents()

      else
        globals.events.on "connection:connected", =>
          @_registerEvents()

    render: ->
      data = { auth: globals.currentAuth }
      compiledTemplate = _.template(sessionChatTemplate, data)
      @$el.html compiledTemplate


    # Registers listeners for events in the application socket.
    _registerEvents: ->

      globals.events.on "chat:msg", (name, msg) =>
        @_addChatMessage(name, msg)
        @_scrollToBottom()

      globals.events.on "chat:all_messages", (messages) =>
        for msgBlock in messages
          @_addChatMessage(msgBlock.username, msgBlock.message)
        @_scrollToBottom()

      globals.events.on "privatechat:user_leave", (userid) =>
        childid = "#user-" + userid + "-private"
        $(childid).remove()

      globals.events.on "privatechat:user_join", (userid, username) =>
        data =
          userID: userid
          username: username
        compiledTemplate = _.template(chatList, data)
        childid = "#user-" + userid + "-private"
        @$(@chatListID).append compiledTemplate
        @$(childid).addClass "clickable"

      globals.events.on "privatechat:load_users", (users) =>
        @$(@chatListID).html ""
        for userBlock in users
          data =
            userID: userBlock.id
            username: userBlock.name
          compiledTemplate = _.template(chatList, data)
          childid = "#user-" + userBlock.id + "-private"
          @$(@chatListID).append compiledTemplate
          @$(childid).addClass "clickable"

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

    # Send a chat message
    _sendMessage: ->
      $chatInput = @$(@chatInputID)
      msg = $chatInput.val()
      if msg? and msg.trim() isnt ""
        globals.connection.emitMsg msg
        $chatInput.val("")
      $chatInput.focus()

    # Add a message to the screen and scroll the chat area to bottom
    _addChatMessage: (username, message) ->
      data =
        username: username
        message: message
      compiledTemplate = _.template(chatMessageTemplate, data)
      @$(@msgBoxID).append compiledTemplate

    # Scrolls the chat area to bottom to show the last messages
    _scrollToBottom: ->
      $msgBox = @$(@msgBoxID)
      $msgBox.prop({ scrollTop: $msgBox.prop("scrollHeight") })

    # A key was pressed in the input box
    _inputKeyPressed: (e) ->
      # Send message when the enter key is pressed
      @_sendMessage() if e.keyCode is 13

    _toggleUserList: ->
      @$(@chatListID).toggle()

    _chooseUser:(e)->
      @$(@chatListID).css "display","none"
      $target = $(e.target)
      username = $target.html()
      buttonTemplate =_.template(privateChatButton, {name:username})
      $("#chatButtonWrapper").append buttonTemplate
      chatBoxTemplate = _.template(privateChatBox, {name:username})
      $("#chat-messages").hide()
      $("#chat").append(chatBoxTemplate)


    _hideAllOtherChatBox:(e)->
      $target = $(e.target)
      username = $target.html()
      $(".private-chat-box").hide()
      $("."+username).show()

    _closePrivateChat:(e)->
      $target = $(e.target)
      username = $target.parent('div').attr('class').split(' ')
      id = username[1]
      $('#'+id).remove()
      $target.parent('div').remove()

    _togglePublicChat:(e)->
      $(".private-chat-box").hide()
      $("#chat-messages").show()

    _scrollUptButton:(e)->
      currentPosition = $("#chatButtonWrapper").scrollTop()
      scrollAmount = $("#chatButtonWrapper").height();
      $("#chatButtonWrapper").scrollTop(currentPosition + scrollAmount)

    _scrollDowntButton:(e)->
      currentPosition = $("#chatButtonWrapper").scrollTop()
      scrollAmount = $("#chatButtonWrapper").height();
      $("#chatButtonWrapper").scrollTop(currentPosition - scrollAmount)

    # TODO: limit/show length of text in chatbox
    # $("#chat-input-box").on "keyup", (e) ->
    #   count = $(this).attr("maxlength")
    #   chcount.innerHTML = max - chatbox.value.length
  SessionChatView
