define [
  'underscore',
  'backbone',
  'socket.io',
  'globals',
  'cs!utils'
], (_, Backbone, IO, globals, Utils) ->

  ConnectionModel = Backbone.Model.extend

    initialize: ->
      @socket = null
      @host = window.location.protocol + "//" + window.location.host

      # Grab pieces of info from the URL
      @authToken = @getUrlVars()["auth_token"]
      @userId = @getUrlVars()["user_id"]
      @meetingId = @getUrlVars()["meeting_id"]
      @username = @getUrlVars()["username"]
      globals.meetingName = decodeURI(@getUrlVars()["meetingName"])      

    disconnect: ->
      alert( " i go through disconnect") # not used right now

    connect: ->
      console.log("user_id=" + @userId + " auth_token=" + @authToken + " meeting_id=" + @meetingId)
      unless @socket?
        console.log "connecting to the socket.io server", @host
        @socket = io.connect()

        # a1 - just a random 
        #@socket = io.connect('#{@host}/a1/#{meetingId}/#{userId}') #TODO

        @_registerEvents()
      else
        console.log "tried to connect but it's already connected"

    emit: (data) ->
      if @isConnected()
        @socket.emit("message", data)
      else
        console.log "Not connected, aborting emission of message", data

    isConnected: ->
      # if we have a socket set we assume we are connected
      @socket?

    # Registers listeners to all events in the websocket. Passes these events to the
    # event bus so that other objects can receive them too.
    _registerEvents: ->

      # All messages received from the server fall in this block
      @socket.on "message", (data) ->
        console.log "socket.io received: data"
        globals.events.trigger("message", data)

      # Immediately say we are connected
      @socket.on "connect", =>
        console.log "socket on: connect"
        globals.events.trigger("connection:connected")

        message = {
          "payload": {
            "auth_token": @authToken
            "userid": @userId
            "meeting_id": @meetingId
          },
          "header": {
            "timestamp": new Date().getTime()
            "name": "validate_auth_token"
          }
        }

        #emit the validate_auth_token json message if the fields have been populated
        if @authToken? and @userId? and @meetingId?
          @socket.emit "message", message

      # Received a list of users from bbb-apps
      # param {object} message object
      @socket.on "get_users_reply", (message) =>
        requesterId = message.payload?.requester_id

        if(requesterId is @userId)
          users = []
          for user in message.payload?.users
            users.push user

          globals.events.trigger("connection:load_users", users)

      # Received a the chat history for a meeting
      # @param {object} message object
      @socket.on "get_chat_history_reply", (message) =>
        requesterId = message.payload?.requester_id
        if(requesterId is @userId)
          globals.events.trigger("connection:all_messages", message.payload?.chat_history)

      # Received event for a new public chat message
      # @param  {object} message object
      @socket.on "send_public_chat_message", (message) ->
        console.log 'got this message:' + JSON.stringify message
        username = message.payload.message.from_username
        text = message.payload.message.message
        globals.events.trigger("connection:msg", username, text)

      # If the server disconnects from the client or vice-versa
      @socket.on "disconnect", ->
        console.log "socket on: disconnect"
        window.location.replace "./"
        globals.events.trigger("connection:disconnected")
        @socket = null

      #@socket.on "reconnect", ->
      #  console.log "socket on: reconnect"
      #  globals.events.trigger("connection:reconnect")

      #@socket.on "reconnecting", ->
      #  console.log "socket on: reconnecting"
      #  globals.events.trigger("connection:reconnecting")

      #@socket.on "reconnect_failed", ->
      #  console.log "socket on: reconnect_failed"
      #  globals.events.trigger("connection:reconnect_failed")

      # If an error occurs while not connected
      # @param  {string} reason Reason for the error.
      #@socket.on "error", (reason) -> #TODO
      #  console.error "unable to connect socket.io", reason

      # Received event to update all the slide images
      # @param  {Array} urls list of URLs to be added to the paper (after old images are removed)
      #@socket.on "all_slides", (allSlidesEventObject) =>
      #  console.log "socket on: all_slides"
      #  console.log "allSlidesEventObject: " + allSlidesEventObject
      #  globals.events.trigger("connection:all_slides", allSlidesEventObject);

      # Received event to clear the whiteboard shapes
      #@socket.on "clrPaper",=>
      #  console.log "socket on: clrPaper"
      #  globals.events.trigger("connection:clrPaper")

      # Received event to update all the shapes in the whiteboard
      # @param  {Array} shapes Array of shapes to be drawn
      #@socket.on "allShapes", (allShapesEventObject) =>
      #  # check for the requester_id
      #  console.log "socket on: all_shapes" + allShapesEventObject
      #  globals.events.trigger("connection:all_shapes", allShapesEventObject)

      # Received event to update all the shapes in the whiteboard
      # @param  {Array} shapes Array of shapes to be drawn
      #@socket.on "get_whiteboard_shapes_reply", (object) =>
      #  if @userId is object.payload?.requester_id
      #    #alert("I am getting some shapes reply" + JSON.stringify object)
      #    for shape in object.payload?.shapes
      #      #alert("for a shape:")
      #      shape_type = shape.shape_type
      #      globals.events.trigger("connection:whiteboard_draw_event", shape_type, shape.shape) # TODO to change the name

      #      globals.events.trigger("connection:updShape", shape_type, shape.shape)

      # Received event to update a shape being created
      # @param  {string} shape type of shape being updated
      # @param  {Array} data   all information to update the shape
      @socket.on "send_whiteboard_shape_message", (data) =>
        alert "send_whiteboard_shape_message" + JSON.stringify data
        shape = data.payload.shape.shape_type
        for point in data.payload.shape.shape.points
          point = point/100 #early attempt to scale down
        globals.events.trigger("connection:whiteboard_draw_event", shape, data)
        globals.events.trigger("connection:updShape", shape, data)

      # Pencil drawings are received as points from the server and painted as lines.
      #@socket.on "whiteboardDrawPen", (data) =>
      #  console.log "socket on: whiteboardDrawPen"+  data
      #  globals.events.trigger("connection:whiteboardDrawPen", data)

      # Received event to update the cursor coordinates
      # @param  {number} x x-coord of the cursor as a percentage of page width
      # @param  {number} y y-coord of the cursor as a percentage of page height
      #@socket.on "mvCur", (data) =>
      #  x = data.cursor.x #TODO change to new json structure
      #  y = data.cursor.y #TODO change to new json structure
      #  console.log "socket on: mvCur"
      #  globals.events.trigger("connection:mvCur", x, y)

      # Received event to update the zoom or move the slide
      # @param  {number} x x-coord of the cursor as a percentage of page width
      # @param  {number} y y-coord of the cursor as a percentage of page height
      #@socket.on "move_and_zoom", (xOffset, yOffset, widthRatio, heightRatio) =>
      #  console.log "socket on: move_and_zoom"
      #  globals.events.trigger("connection:move_and_zoom", xOffset, yOffset, widthRatio, heightRatio)

      # Received event to update the slide image
      # @param  {string} url URL of image to show
      #@socket.on "changeslide", (url) =>
      #  console.log "socket on: changeslide"
      #  globals.events.trigger("connection:changeslide", url)

      # Received event to update the viewBox value
      # @param  {string} xperc Percentage of x-offset from top left corner
      # @param  {string} yperc Percentage of y-offset from top left corner
      # @param  {string} wperc Percentage of full width of image to be displayed
      # @param  {string} hperc Percentage of full height of image to be displayed
      # TODO: not tested yet
      #@socket.on "viewBox", (xperc, yperc, wperc, hperc) =>
      #  console.log "socket on: viewBox"
      #  globals.events.trigger("connection:viewBox", xperc, yperc, wperc, hperc)


      # Received event to update the zoom level of the whiteboard.
      # @param  {number} delta amount of change in scroll wheel
      #@socket.on "zoom", (delta) ->
      #  console.log "socket on: zoom"
      #  globals.events.trigger("connection:zoom", delta)

      # Received event to update the whiteboard size and position
      # @param  {number} cx x-offset from top left corner as percentage of original width of paper
      # @param  {number} cy y-offset from top left corner as percentage of original height of paper
      # @param  {number} sw slide width as percentage of original width of paper
      # @param  {number} sh slide height as a percentage of original height of paper
      #@socket.on "paper", (cx, cy, sw, sh) ->
      #  console.log "socket on: paper"
      #  globals.events.trigger("connection:paper", cx, cy, sw, sh)

      # Received event when the panning action finishes
      #@socket.on "panStop", ->
      #  console.log "socket on: panStop"
      #  globals.events.trigger("connection:panStop")


      # Received event to denote when the text has been created
      #@socket.on "textDone", ->
      #  console.log "socket on: textDone"
      #  globals.events.trigger("connection:textDone")

      # Received event to update the status of the upload progress
      # @param  {string} message  update message of status of upload progress
      # @param  {boolean} fade    true if you wish the message to automatically disappear after 3 seconds
      #@socket.on "uploadStatus", (message, fade) =>
      #  console.log "socket on: uploadStatus"
      #  globals.events.trigger("connection:uploadStatus", message, fade)

      # Received event for a user list change
      # @param  {Array} users Array of names and publicIDs of connected users
      # TODO: event name with spaces is bad
      #@socket.on "user list change", (users) =>
      #  console.log "socket on: user list change"
      #  globals.events.trigger("connection:user_list_change", users)

      # Received event for a new user
      @socket.on "user_joined_message", (message) =>
        userid = message.payload.user.userid
        username = message.payload.user.name
        globals.events.trigger("connection:user_join", userid, username)

      # Received event when a user leaves
      @socket.on "user_left_message", (message) ->
        userid = message.payload.user.userid
        globals.events.trigger("connection:user_left", userid)

      # Received event to set the presenter to a user
      # @param  {string} userID publicID of the user that is being set as the current presenter
      #@socket.on "setPresenter", (userid) =>
      #  console.log "socket on: setPresenter"
      #  globals.events.trigger("connection:setPresenter", userid)

      # Received event to update all the messages in the chat box
      # @param  {Array} messages Array of messages in public chat box
      #@socket.on "all_messages", (allMessagesEventObject) =>
      #  console.log "socket on: all_messages" + allMessagesEventObject
      #  globals.events.trigger("connection:all_messages", allMessagesEventObject)

      # Change the current slide/page [if any] with the one
      # contained in the message
      @socket.on "presentation_page", (message) ->
        console.log "socket on: presentation_page"
        globals.events.trigger("connection:display_page", message)

    # Emit an update to move the cursor around the canvas
    # @param  {number} x x-coord of the cursor as a percentage of page width
    # @param  {number} y y-coord of the cursor as a percentage of page height
    emitMoveCursor: (x, y) ->
      @socket.emit "mvCur", x, y

    # Requests the shapes from the server.
    #emitAllShapes: ->
    #  @socket.emit "all_shapes"

    # Emit a chat message to the server
    # @param  {string} the chat message
    emitMsg: (msg) ->
      object = {
        "header": {
          "name": "send_public_chat_message"
          "timestamp": new Date().getTime()
          "version": "0.0.1"
        }
        "payload": {
          "meeting_id": @meetingId
          "requester_id": @userId
          "message": {
            "chat_type": "PUBLIC_CHAT"
            "message": msg
            "to_username": "public_chat_username"
            "from_tz_offset": "240"
            "from_color": "0"
            "to_userid": "public_chat_userid"
            "from_userid": @userId
            "from_time": "1.400869381346E12"
            "from_username": @username
            "from_lang": "en"
          }
        }
      }
      @socket.emit "message", object

    # Emit the finish of a text shape
    #emitTextDone: ->
    #  @socket.emit "textDone"

    # Emit the creation of a shape
    # @param  {string} shape type of shape
    # @param  {Array} data  all the data required to draw the shape on the client whiteboard
    #emitMakeShape: (shape, data) ->
    #  @socket.emit "makeShape", shape, data

    # Emit the update of a shape
    # @param  {string} shape type of shape
    # @param  {Array} data  all the data required to update the shape on the client whiteboard
    #emitUpdateShape: (shape, data) ->
    #  @socket.emit "updShape", shape, data

    # Emit an update in the whiteboard position/size values
    # @param  {number} cx x-offset from top left corner as percentage of original width of paper
    # @param  {number} cy y-offset from top left corner as percentage of original height of paper
    # @param  {number} sw slide width as percentage of original width of paper
    # @param  {number} sh slide height as a percentage of original height of paper
    #emitPaperUpdate: (cx, cy, sw, sh) ->
    #  @socket.emit "paper", cx, cy, sw, sh

    # Update the zoom level for the clients
    # @param  {number} delta amount of change in scroll wheel
    emitZoom: (delta) ->
      @socket.emit "zoom", delta

    # Request the next slide
    #emitNextSlide: ->
    #  @socket.emit "nextslide"

    # Request the previous slide
    #emitPreviousSlide: ->
    #  @socket.emit "prevslide"

    # Logout of the meeting
    emitLogout: ->
      message = {
        "payload": {
          "meeting_id": @meetingId
          "userid": @userId
        },
        "header": {
          "timestamp": new Date().getTime()
          "name": "user_leaving_request"
          "version": "0.0.1"
        }
      }
      @socket.emit "message", message
      @socket.disconnect()

      #Utils.postToUrl "logout"
      #window.location.replace "./"

    # Emit panning has stopped
    #emitPanStop: ->
    #  @socket.emit "panStop"

    # Publish a shape to the server to be saved
    # @param  {string} shape type of shape to be saved
    # @param  {Array} data   information about shape so that it can be recreated later
    #emitPublishShape: (shape, data) ->
    #  @socket.emit "saveShape", shape, JSON.stringify(data)

    # Emit a change in the current tool
    # @param  {string} tool [description]
    #emitChangeTool: (tool) ->
    #  @socket.emit "changeTool", tool

    # Tell the server to undo the last shape
    #emitUndo: ->
    #  @socket.emit "undo"

    # Emit a change in the presenter
    #emitSetPresenter: (id) ->
    #  @socket.emit "setPresenter", id

    # Emit signal to clear the canvas
    #emitClearCanvas: (id) ->
    #  @socket.emit "clrPaper", id

    # Helper method to get the meeting_id, user_id and auth_token from the url
    getUrlVars: ->
      vars = {}
      parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m,key,value) ->
        vars[key] = value
      )
      vars

  ConnectionModel
