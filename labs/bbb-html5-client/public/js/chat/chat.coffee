define [ "jquery", "raphael", "cs!chat/whiteboard", "cs!chat/connection" ], ($, Raphael, Whiteboard, Connection) ->

  Chat = {}

  # shortcut to the socket object
  socket = Connection.socket

  msgbox = document.getElementById("chat_messages")
  chatbox = document.getElementById("chat_input_box")

  # Received event to update all the shapes in the whiteboard
  # @param  {Array} shapes Array of shapes to be drawn
  socket.on "all_shapes", (shapes) ->
    Whiteboard.clearPaper()
    Whiteboard.drawListOfShapes shapes

  socket.on "reconnect", ->
    msgbox.innerHTML += "<div><b> RECONNECTED! </b></div>"

  socket.on "reconnecting", ->
    msgbox.innerHTML += "<div><b> Reconnecting... </b></div>"

  socket.on "reconnect_failed", ->
    msgbox.innerHTML += "<div><b> Reconnect FAILED! </b></div>"

  # Received event to clear the whiteboard shapes
  socket.on "clrPaper", ->
    Whiteboard.clearPaper()

  # Received event to update the viewBox value
  # @param  {string} xperc Percentage of x-offset from top left corner
  # @param  {string} yperc Percentage of y-offset from top left corner
  # @param  {string} wperc Percentage of full width of image to be displayed
  # @param  {string} hperc Percentage of full height of image to be displayed
  socket.on "viewBox", (xperc, yperc, wperc, hperc) ->
    xperc = parseFloat(xperc, 10)
    yperc = parseFloat(yperc, 10)
    wperc = parseFloat(wperc, 10)
    hperc = parseFloat(hperc, 10)
    Whiteboard.updatePaperFromServer xperc, yperc, wperc, hperc

  # Received event to update the cursor coordinates
  # @param  {number} x x-coord of the cursor as a percentage of page width
  # @param  {number} y y-coord of the cursor as a percentage of page height
  socket.on "mvCur", (x, y) ->
    Whiteboard.mvCur x, y

  # Received event to update the slide image
  # @param  {string} url URL of image to show
  socket.on "changeslide", (url) ->
    Whiteboard.showImageFromPaper url

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

  # Received event to create a shape on the whiteboard
  # @param  {string} shape type of shape being made
  # @param  {Array} data   all information to make the shape
  socket.on "makeShape", (shape, data) ->
    switch shape
      when "line"
        Whiteboard.makeLine.apply makeLine, data
      when "rect"
        Whiteboard.makeRect.apply Whiteboard.makeRect, data
      when "ellipse"
        Whiteboard.makeEllipse.apply Whiteboard.makeEllipse, data
      else
        console.log "shape not recognized at makeShape", shape

  # Received event to update a shape being created
  # @param  {string} shape type of shape being updated
  # @param  {Array} data   all information to update the shape
  socket.on "updShape", (shape, data) ->
    switch shape
      when "line"
        Whiteboard.updateLine.apply updateLine, data
      when "rect"
        Whiteboard.updateRect.apply Whiteboard.updateRect, data
      when "ellipse"
        Whiteboard.updateEllipse.apply Whiteboard.updateEllipse, data
      when "text"
        Whiteboard.updateText.apply Whiteboard.updateText, data
      else
        console.log "shape not recognized at updShape", shape

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
