define [
  'jquery',
  'underscore',
  'backbone',
  'globals',
  'text!templates/user.html',
], ($, _, Backbone, globals, userTemplate) ->

  # The users panel in a session
  # The contents are rendered by SessionView, this class is Used to
  # manage the events in the users.
  SessionUsersView = Backbone.View.extend
    events:
      "click #switch-presenter": "_switchPresenter"
      "click .user": "_userClicked"

    initialize: ->
      @userListID = "#current_users"

      # Bind to the event triggered when the client connects to the server
      globals.connection.bind "connection:connected",
        @_registerConnectionEvents, @

    # don't need to render anything, the rendering is done by SessionView.
    render: ->

    # Registers listeners for events in the application socket.
    _registerConnectionEvents: ->
      socket = globals.connection.socket

      # Received event for a new public chat message
      # @param  {Array} users Array of names and publicIDs of connected users
      socket.on "user list change", (users) =>
        @_removeAllUsers()
        for userBlock in users
          @_addUser(userBlock.id, userBlock.name)

      # Received event to set the presenter to a user
      # @param  {string} userID publicID of the user that is being set as the current presenter
      socket.on "setPresenter", (userID) =>
        @_setPresenter(userID)

    # Removes all users from the screen.
    _removeAllUsers: ->
      @$(@userListID).empty()

    # Add a user to the screen.
    _addUser: (userID, username) ->
      data =
        username: username
        userID: userID
      compiledTemplate = _.template(userTemplate, data)
      @$(@userListID).append compiledTemplate

    # Marks a user as selected when clicked.
    _userClicked: (e) ->
      @$('.user.selected').removeClass('selected')
      @$(e.target).addClass('selected')

    # Sets the current presenter to the user currently selected.
    _switchPresenter: ->
      id = @$(".user.selected").attr("id").replace("user-", "")
      globals.connection.emitSetPresenter id

    # Sets the user with ID `userID` as the presenter.
    _setPresenter: (userID) ->
      @$(".user.presenter").removeClass "presenter"
      @$("#user-#{userID}").addClass "presenter"

  SessionUsersView
