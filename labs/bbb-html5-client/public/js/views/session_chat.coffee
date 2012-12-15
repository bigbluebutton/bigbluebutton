define [
  'jquery',
  'underscore',
  'backbone',
  'globals',
  'text!templates/chat_message.html',
], ($, _, Backbone, globals, chatMessageTemplate) ->

  # The chat panel in a session
  # The contents are rendered by SessionView, this class is Used to
  # manage the events in the chat.
  SessionChatView = Backbone.View.extend
    events:
      "click button#chat-send": "_sendMessage"
      "keyup #chat-input-box": "_inputKeyPressed"

    initialize: ->
      @chatInputID = "#chat-input-box"
      @msgBoxID = "#chat-messages"

      # Bind to the event triggered when the client connects to the server
      globals.connection.bind "connection:connected",
        @_registerConnectionEvents, @

    # don't need to render anything, the rendering is done by SessionView
    render: ->

    # Registers listeners for events in the application socket.
    _registerConnectionEvents: ->
      socket = globals.connection.socket

      # Received event for a new public chat message
      # @param  {string} name name of user
      # @param  {string} msg  message to be displayed
      socket.on "msg", (name, msg) =>
        @_addChatMessage(name, msg)
        @_scrollToBottom()

      # Received event to update all the messages in the chat box
      # @param  {Array} messages Array of messages in public chat box
      socket.on "all_messages", (messages) =>
        for msgBlock in messages
          @_addChatMessage(msgBlock.username, msgBlock.message)
        @_scrollToBottom()

      # TODO: for now these messages are only being shown in the chat, maybe
      #       they should have their own view and do more stuff
      #       (e.g. disable the interface when disconnected)
      socket.on "connect", =>
        @_addChatMessage("system", "Connected to the server.")
      socket.on "disconnect", =>
        @_addChatMessage("system", "Disconnected form the server.")
      socket.on "reconnect", =>
        @_addChatMessage("system", "Reconnected!")
      socket.on "reconnecting", =>
        @_addChatMessage("system", "Reconnecting...")
      socket.on "reconnect_failed", =>
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

    # TODO: limit/show length of text in chatbox
    # $("#chat-input-box").on "keyup", (e) ->
    #   count = $(this).attr("maxlength")
    #   chcount.innerHTML = max - chatbox.value.length

  SessionChatView
