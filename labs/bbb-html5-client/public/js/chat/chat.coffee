define [ "jquery", "raphael", "cs!chat/whiteboard", "cs!chat/connection" ], ($, Raphael, Whiteboard, Connection) ->

  Chat = {}

  # shortcut to the socket object
  socket = Connection.socket

  msgbox = document.getElementById("chat_messages")
  chatbox = document.getElementById("chat_input_box")

  # Received event to update the whiteboard between fit to width and fit to page
  # @param  {boolean} fit choice of fit: true for fit to page, false for fit to width
  socket.on "fitToPage", (fit) ->
    Whiteboard.setFitToPage fit

  # Received event to update the zoom level of the whiteboard.
  # @param  {number} delta amount of change in scroll wheel
  socket.on "zoom", (delta) ->
    Whiteboard.setZoom delta

  # Received event when the panning action finishes
  socket.on "panStop", ->
    panDone()

  # Received event to denote when the text has been created
  socket.on "textDone", ->
    Whiteboard.textDone()

  # Received event to change the current tool
  # @param  {string} tool tool to be turned on
  socket.on "toolChanged", (tool) ->
    Whiteboard.turnOn tool

  # Received event to update the whiteboard size and position
  # @param  {number} cx x-offset from top left corner as percentage of original width of paper
  # @param  {number} cy y-offset from top left corner as percentage of original height of paper
  # @param  {number} sw slide width as percentage of original width of paper
  # @param  {number} sh slide height as a percentage of original height of paper
  socket.on "paper", (cx, cy, sw, sh) ->
    Whiteboard.updatePaperFromServer cx, cy, sw, sh

  # Received event to update the status of the upload progress
  # @param  {string} message  update message of status of upload progress
  # @param  {boolean} fade    true if you wish the message to automatically disappear after 3 seconds
  socket.on "uploadStatus", (message, fade) ->
    $("#uploadStatus").text message
    if fade
      setTimeout (->
        $("#uploadStatus").text ""
      ), 3000

  # Clear the canvas drawings
  Chat.clearCanvas = ->
    socket.emit "clrPaper"

  Chat
