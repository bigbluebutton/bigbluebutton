define [ "jquery", "raphael", "cs!chat/whiteboard", "cs!chat/connection" ], ($, Raphael, Whiteboard, Connection) ->

  Chat = {}

  # shortcut to the socket object
  socket = Connection.socket

  msgbox = document.getElementById("chat_messages")
  chatbox = document.getElementById("chat_input_box")

  # Received event to denote when the text has been created
  socket.on "textDone", ->
    Whiteboard.textDone()

  # Received event to change the current tool
  # @param  {string} tool tool to be turned on
  socket.on "toolChanged", (tool) ->
    Whiteboard.turnOn tool

  Chat
