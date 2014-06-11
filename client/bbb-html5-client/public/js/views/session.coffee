define [
  'jquery',
  'underscore',
  'backbone',
  'globals',
  'text!templates/session.html',
  'cs!views/session_navbar',
  'cs!views/session_navbar_hidden',
  'cs!views/session_chat',
  'cs!views/session_users',
  'cs!views/SingleUserView',
  'cs!views/session_video'
  'cs!views/session_whiteboard'
], ($, _, Backbone, globals, sessionTemplate, SessionNavbarView, SessionNavbarHiddenView,
    SessionChatView, SessionUsersView, SingleUserView, SessionVideoView, SessionWhiteboardView) ->

  SessionView = Backbone.View.extend
    tagName: 'section'
    id: 'session-view'

    initialize: ->
      @navbarView = new SessionNavbarView()
      @navbarView.$parentEl = @$el
      @navbarHiddenView = new SessionNavbarHiddenView()
      @navbarHiddenView.$parentEl = @$el
      @chatView = new SessionChatView()
      @singleUserView = new SingleUserView()
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

      @assign(@navbarView, "#navbar")
      @assign(@navbarHiddenView, "#navbar-hidden")
      @assign(@chatView, "#chat")
      @assign(@usersView, "#users")
      @assign(@videoView, "#video")
      @assign(@whiteboardView, "#whiteboard")

      @$el.addClass('navbar-on') # navbar starts visible

      # Connect to the server and authenticate the user
      globals.connection.connect()

  SessionView
