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
      "click #switch-presenter": "switchPresenter"
      "click .user": "userClicked"

    initialize: ->
      @userListID = "#current_users"

      # Bind to the event triggered when the client connects to the server
      globals.connection.bind "connection:connected",
        this.registerConnectionEvents, this

    # Registers listeners for events in the application socket.
    registerConnectionEvents: ->
      socket = globals.connection.socket

      # Received event for a new public chat message
      # @param  {Array} users Array of names and publicIDs of connected users
      socket.on "user list change", (users) =>
        @removeAllUsers()
        for userBlock in users
          @addUser(userBlock.id, userBlock.name)

      # Received event to set the presenter to a user
      # @param  {string} userID publicID of the user that is being set as the current presenter
      socket.on "setPresenter", (userID) =>
        @setPresenter(userID)

    # don't need to render anything, the rendering is done by SessionView.
    render: ->

    # Removes all users from the screen.
    removeAllUsers: ->
      @$(@userListID).empty()

    # Add a user to the screen.
    addUser: (userID, username) ->
      data =
        username: username
        userID: userID
      compiledTemplate = _.template(userTemplate, data)
      @$(@userListID).append compiledTemplate

    # Marks a user as selected when clicked.
    userClicked: (e) ->
      @$('.user.selected').removeClass('selected')
      @$(e.target).addClass('selected')

    # Sets the current presenter to the user currently selected.
    switchPresenter: ->
      id = @$(".user.selected").attr("id").replace("user-", "")
      globals.connection.emitSetPresenter id

    # Sets the user with ID `userID` as the presenter.
    setPresenter: (userID) ->
      @$(".user.presenter").removeClass "presenter"
      @$("#user-#{userID}").addClass "presenter"

  SessionUsersView
