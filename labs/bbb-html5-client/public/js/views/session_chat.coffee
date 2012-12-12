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
      "click button#chat-send": "sendMessage"
      "keyup #chat-input-box": "inputKeyPressed"

    initialize: ->
      @chatInputID = "#chat-input-box"
      @msgBoxID = "#chat-messages"

      # Bind to the event triggered when the client connects to the server
      globals.connection.bind "connection:connected",
        this.registerConnectionEvents, this

    # Registers listeners for events in the application socket.
    registerConnectionEvents: ->
      socket = globals.connection.socket

      # Received event for a new public chat message
      # @param  {string} name name of user
      # @param  {string} msg  message to be displayed
      socket.on "msg", (name, msg) =>
        @addChatMessage(name, msg)
        @scrollToBottom()

      # Received event to update all the messages in the chat box
      # @param  {Array} messages Array of messages in public chat box
      socket.on "all_messages", (messages) =>
        for msgBlock in messages
          @addChatMessage(msgBlock.username, msgBlock.message)
        @scrollToBottom()

      # TODO: for now these messages are only being shown in the chat, maybe
      #       they should have their own view and do more stuff
      #       (e.g. disable the interface when disconnected)
      socket.on "connect", =>
        @addChatMessage("system", "Connected to the server.")
      socket.on "disconnect", =>
        @addChatMessage("system", "Disconnected form the server.")
      socket.on "reconnect", =>
        @addChatMessage("system", "Reconnected!")
      socket.on "reconnecting", =>
        @addChatMessage("system", "Reconnecting...")
      socket.on "reconnect_failed", =>
        @addChatMessage("system", "Reconnect failed!")

    # don't need to render anything, the rendering is done by SessionView
    render: ->

    # Send a chat message
    sendMessage: ->
      $chatInput = @$(@chatInputID)
      msg = $chatInput.val()
      if msg? and msg.trim() isnt ""
        globals.connection.emitMsg msg
        $chatInput.val("")
      $chatInput.focus()

    # Add a message to the screen and scroll the chat area to bottom
    addChatMessage: (username, message) ->
      data =
        username: username
        message: message
      compiledTemplate = _.template(chatMessageTemplate, data)
      @$(@msgBoxID).append compiledTemplate

    # Scrolls the chat area to bottom to show the last messages
    scrollToBottom: ->
      $msgBox = @$(@msgBoxID)
      $msgBox.prop({ scrollTop: $msgBox.prop("scrollHeight") })

    # A key was pressed in the input box
    inputKeyPressed: (e) ->
      # Send message when the enter key is pressed
      @sendMessage() if e.keyCode is 13

    # TODO
    # $("#chat-input-box").on "keyup", (e) ->
    #   count = $(this).attr("maxlength")
    #   chcount.innerHTML = max - chatbox.value.length

  SessionChatView
