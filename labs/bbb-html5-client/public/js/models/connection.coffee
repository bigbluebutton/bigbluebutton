define [
  'underscore',
  'backbone',
  'socket.io',
  'cs!utils'
], (_, Backbone, io, Utils) ->

  ConnectionModel = Backbone.Model.extend

    initialize: ->
      @socket = null
      @host = window.location.protocol + "//" + window.location.host

    disconnect: ->
      if @socket?
        console.log "disconnecting from", @host
        @socket.disconnect()
        @socket = null
        @trigger('connection:disconnected')
      else
        console.log "tried to disconnect but it's not connected"

    connect: ->
      unless @socket?
        console.log "connecting to the server", @host
        @socket = io.connect(@host)
        @registerEvents()
        @trigger('connection:connected');
      else
        console.log "tried to connect but it's already connected"

    # Registers listeners to some events in the websocket.
    # Events here are generic and related to the connection.
    registerEvents: ->

      # Immediately say we are connected
      @socket.on "connect", =>
        console.log "socket on: connect"
        @socket.emit "user connect"

      # Received event to logout yourself
      @socket.on "logout", ->
        console.log "socket on: logout"
        Utils.postToUrl "logout"
        window.location.replace "./"

      # If the server disconnects from the client or vice-versa
      @socket.on "disconnect", ->
        console.log "socket on: disconnect"
        window.location.replace "./"

      # If an error occurs while not connected
      # @param  {string} reason Reason for the error.
      @socket.on "error", (reason) ->
        console.error "unable to connect socket.io", reason

    # Emit an update to move the cursor around the canvas
    # @param  {number} x x-coord of the cursor as a percentage of page width
    # @param  {number} y y-coord of the cursor as a percentage of page height
    emitMoveCursor: (x, y) ->
      @socket.emit "mvCur", x, y

    # Requests the shapes from the server.
    emitAllShapes: ->
      @socket.emit "all_shapes"

    # Emit an update in a fit of the whiteboard
    # @param  {boolean} true for fitToPage, false for fitToWidth
    emitFitToPage: (value) ->
      @socket.emit "fitToPage", value

    # Emit a message to the server
    # @param  {string} the message
    emitMsg: (msg) ->
      @socket.emit "msg", msg

    # Emit the finish of a text shape
    emitTextDone: ->
      @socket.emit "textDone"

    # Emit the creation of a shape
    # @param  {string} shape type of shape
    # @param  {Array} data  all the data required to draw the shape on the client whiteboard
    emitMakeShape: (shape, data) ->
      @socket.emit "makeShape", shape, data

    # Emit the update of a shape
    # @param  {string} shape type of shape
    # @param  {Array} data  all the data required to update the shape on the client whiteboard
    emitUpdateShape: (shape, data) ->
      @socket.emit "updShape", shape, data

    # Emit an update in the whiteboard position/size values
    # @param  {number} cx x-offset from top left corner as percentage of original width of paper
    # @param  {number} cy y-offset from top left corner as percentage of original height of paper
    # @param  {number} sw slide width as percentage of original width of paper
    # @param  {number} sh slide height as a percentage of original height of paper
    emitPaperUpdate: (cx, cy, sw, sh) ->
      @socket.emit "paper", cx, cy, sw, sh

    # Update the zoom level for the clients
    # @param  {number} delta amount of change in scroll wheel
    emitZoom: (delta) ->
      @socket.emit "zoom", delta

    # Request the next slide
    emitNextSlide: ->
      @socket.emit "nextslide"

    # Request the previous slide
    emitPreviousSlide: ->
      @socket.emit "prevslide"

    # Logout of the meeting
    emitLogout: ->
      @socket.emit "logout"

    # Emit panning has stopped
    emitPanStop: ->
      @socket.emit "panStop"

    # Publish a shape to the server to be saved
    # @param  {string} shape type of shape to be saved
    # @param  {Array} data   information about shape so that it can be recreated later
    emitPublishShape: (shape, data) ->
      @socket.emit "saveShape", shape, JSON.stringify(data)

    # Emit a change in the current tool
    # @param  {string} tool [description]
    emitChangeTool: (tool) ->
      @socket.emit "changeTool", tool

    # Tell the server to undo the last shape
    emitUndo: ->
      @socket.emit "undo"

    # Emit a change in the presenter
    emitSetPresenter: (id) ->
      @socket.emit "setPresenter", id

    # Emit signal to clear the canvas
    emitClearCanvas: (id) ->
      @socket.emit "clrPaper", id

  ConnectionModel
