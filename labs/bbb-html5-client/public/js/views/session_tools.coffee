define [
  'jquery',
  'underscore',
  'backbone',
  'globals',
  'text!templates/tools.html'

], ($, _, Backbone, globals, sessionToolsTemplate) ->

  # The navbar in a session
  # The contents are rendered by SessionView, this class is Used to
  # manage the events in the navbar.
  SessionToolsView = Backbone.View.extend
    events:
      # TODO: temporary adaptation for iPads: chat always visible
      # "click #chat-btn": "_toggleChat"

      "click #prev-slide-btn": "_previousSlide"
      "click #next-slide-btn": "_nextSlide"
      "click #tool-pan-btn": "_toolPan"
      "click #tool-line-btn": "_toolLine"
      "click #tool-rect-btn": "_toolRect"
      "click #tool-ellipse-btn": "_toolEllipse"
      "click #tool-toggle-btn": "_toolToggle"
      "click #slide-upload-button": "_chooseFileUpload"
      "click #closeUploadWindow": "_closeUpload"


    
    initialize: ->
      @$parentEl = null
      
    render: ->
      compiledTemplate = _.template(sessionToolsTemplate)
      @$el.html compiledTemplate

    _toolToggle:->
      $("#toggleToolBar").toggle()
        
    _chooseFileUpload:->
      $('#slide-upload-controls').toggle().draggable()
          
    _closeUpload:->
      $('#slide-upload-controls').toggle()
      
    # Go to the previous slide
    _previousSlide: ->
      globals.connection.emitPreviousSlide()

    # Go to the next slide
    _nextSlide: ->
      globals.connection.emitNextSlide()

    # "Pan" tool was clicked
    _toolPan: ->
      globals.connection.emitChangeTool("panzoom")

    # "Line" tool was clicked
    _toolLine: ->
      globals.connection.emitChangeTool("line")

    # "Rect" tool was clicked
    _toolRect: ->
      globals.connection.emitChangeTool("rect")

    # "Ellipse" tool was clicked
    _toolEllipse: ->
      globals.connection.emitChangeTool("ellipse")

  SessionToolsView
