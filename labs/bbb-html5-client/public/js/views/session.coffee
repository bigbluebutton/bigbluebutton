define [
  'jquery',
  'underscore',
  'backbone',
  'globals',
  'text!templates/session.html',
  'cs!views/session_navbar',
  'cs!views/session_chat',
  'cs!views/session_users',
  'cs!views/session_video'
  'cs!views/session_whiteboard'
], ($, _, Backbone, globals, sessionTemplate, SessionNavbarView,
    SessionChatView, SessionUsersView, SessionVideoView,
    SessionWhiteboardView) ->

  SessionView = Backbone.View.extend
    id: 'session-view'
    # className: 'users-enabled' # to start with #users opened

    initialize: ->
      @navbarView = new SessionNavbarView()
      @navbarView.$parentEl = @$el
      @chatView = new SessionChatView()
      @usersView = new SessionUsersView()
      @videoView = new SessionVideoView()
      @whiteboardView = new SessionWhiteboardView()

    # Override the close() method so we can close the sub-views.
    close: ->
      @navbarView.close()
      @chatView.close()
      @usersView.close()
      @whiteboardView.close()
      Backbone.View.prototype.close.call(@)

    render: ->
      compiledTemplate = _.template(sessionTemplate)
      @$el.html compiledTemplate

      # TODO: temporary adaptation for iPads
      @$el.addClass("chat-enabled")

      @assign(@navbarView, "#navbar")
      @assign(@chatView, "#chat")
      @assign(@usersView, "#users")
      @assign(@videoView, "#video")
      @assign(@whiteboardView, "#whiteboard")

      # Connect to the server
      globals.connection.connect()

  SessionView
