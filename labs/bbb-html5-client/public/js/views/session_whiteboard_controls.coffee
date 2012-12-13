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
      globals.connection.bind "connection:connected",
        @_registerConnectionEvents, @

    # don't need to render anything, the rendering is done by SessionView.
    render: ->

    # Registers listeners for events in the application socket.
    _registerConnectionEvents: ->
      socket = globals.connection.socket

      # Received event to update the status of the upload progress
      # @param  {string} message  update message of status of upload progress
      # @param  {boolean} fade    true if you wish the message to automatically disappear after 3 seconds
      socket.on "uploadStatus", (message, fade) =>
        console.log "received uploadStatus"
        @setUploadStatus message, fade

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
