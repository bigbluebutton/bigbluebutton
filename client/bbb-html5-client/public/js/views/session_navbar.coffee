define [
  'jquery',
  'underscore',
  'backbone',
  'globals',
  'text!templates/session_navbar.html'
], ($, _, Backbone, globals, sessionNavbarTemplate) ->

  # The navbar in a session
  # The contents are rendered by SessionView, this class is Used to
  # manage the events in the navbar.
  # @todo it triggers window.resize() in several methods so the svg inside the presentation is
  #   redraw properly, but this should be more dynamic in the future
  SessionNavbarView = Backbone.View.extend
    events:
      "click #hide-menu-btn": "_hideMenu"
      "click #users-btn": "_toggleUsers"
      "click #chat-btn": "_toggleChat"
      "click #video-btn": "_toggleVideo"
      "click #audio-btn": "_toggleAudio"
      "click #logout-btn": "_logout"

    initialize: ->
      @$parentEl = null
      @usersShown = true # Whether the user's pane is displayed, it is displayed be default 

    render: ->
      compiledTemplate = _.template(sessionNavbarTemplate)
      @$el.html compiledTemplate
      @_setToggleButtonsStatus()

    # Ensure the status of the toggle buttons is ok
    _setToggleButtonsStatus: ->
      $("#chat-btn", @$el).toggleClass "active", @$parentEl.hasClass("chat-on")
      $("#users-btn", @$el).toggleClass "active", @$parentEl.hasClass("users-on")
      $("#video-btn", @$el).toggleClass "active", @$parentEl.hasClass("video-on")
      $("#audio-btn", @$el).toggleClass "active", @$parentEl.hasClass("audio-on")

    # Toggle the visibility of the chat panel
    _toggleChat: ->
      @_scheduleResize('#chat') # has to be the first method called!
      @$parentEl.toggleClass('chat-on')
      @_setToggleButtonsStatus()

    # Toggle the visibility of the user's pane
    _toggleUsers: ->
      if @usersShown # If the user's pane is displayed, hide it and mark flag as hidden
        $("#users").hide()
        @usersShown=false
      else # Display the pane
        $("#users").show()
        @usersShown=true
      #@$parentEl.toggleClass('users-on')
      @_setToggleButtonsStatus()

    _toggleVideo: ->
      @_scheduleResize('#video') # has to be the first method called!
      @$parentEl.toggleClass('video-on')
      @_setToggleButtonsStatus()

    _toggleAudio: ->
      @$parentEl.toggleClass('audio-on')
      @_setToggleButtonsStatus()

    _hideMenu: ->
      @$parentEl.removeClass('navbar-on')
      @_setToggleButtonsStatus()

    # Waits for an element with id `id` to be displayed or hidden in the page.
    # Hackishy way to update the size of the presentation when a section of the page
    # is made visible or hidden.
    _scheduleResize: (id) ->
      attempts = 0
      before = $(id).is(':visible')
      console.log "isvisible: "+before
      interval = setInterval( ->
        if $(id).is(':visible') != before or attempts > 20
          attempts += 1
          clearInterval(interval)
          # @todo why do we have to do it twice? doing only once doesn't work as expected!
          $(window).resize()
          $(window).resize()
      , 100)

    # Log out of the session
    _logout: ->
      globals.connection.emitLogout()
      #globals.currentAuth = null

  SessionNavbarView
