define [
  'jquery',
  'underscore',
  'backbone',
  'raphael',
  'globals'
], ($, _, Backbone, Raphael, globals) ->

  # The whiteboard controls
  SessionWhiteboardControlsView = Backbone.View.extend
    events:
      "click #slide-clean-btn": "_cleanClick"
      "click #slide-text-btn": "_textClick"
      "click #slide-undo-btn": "_undoClick"
      "click #slide-fit-to-page-btn": "_fitToPageClick"
      "click #slide-fit-to-width-btn": "_fitToWidthClick"
      "change #slide-upload-file": "_uploadFileSelected"
      "submit #slide-upload-form": "_uploadFormSubmit"

    initialize: ->
      # Bind to the event triggered when the client connects to the server
      if globals.connection.isConnected()
        @_registerEvents()
      else
        globals.events.on "connection:connected", =>
          @_registerEvents()

    # don't need to render anything, the rendering is done by the parent view.
    render: ->

    clearUploadStatus: ->
      @$("#slide-upload-status").text ""

    # @param  {string} message  update message of status of upload progress
    # @param  {boolean} fade    true if you wish the message to automatically disappear after 3 seconds
    setUploadStatus: (message, fade) ->
      $textInput = @$("#slide-upload-status")
      $textInput.text message
      if fade
        setTimeout (->
          $textInput.text ""
        ), 3000

    # Registers listeners for events in the application socket.
    _registerEvents: ->
      globals.events.on "whiteboard:paper:uploadStatus", (message, fade) =>
        @setUploadStatus(message, fade)

    _uploadFileSelected: ->
      @$("#slide-upload-form").submit()

    _uploadFormSubmit: ->
      @setUploadStatus "Uploading..."
      @$("#slide-upload-form").ajaxSubmit
        error: (xhr) ->
          console.log "Error uploading file:", xhr.status
        success: (response) ->
          console.log "Success uploading file!"
      # Have to stop the form from submitting and causing refresh
      false

    _cleanClick: ->
      globals.connection.emitClearCanvas()

    _textClick: ->
      globals.connection.emitChangeTool("text")

    _undoClick: ->
      globals.connection.emitUndo()

    _fitToPageClick: ->
      globals.connection.emitFitToPage(true)

    _fitToWidthClick: ->
      globals.connection.emitFitToPage(false)

   SessionWhiteboardControlsView
