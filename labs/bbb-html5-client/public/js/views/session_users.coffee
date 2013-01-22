define [
  'jquery',
  'underscore',
  'backbone',
  'globals',
  'text!templates/session_users.html',
  'text!templates/user.html',
], ($, _, Backbone, globals, sessionUsersTemplate, userTemplate) ->

  # The users panel in a session
  # The contents are rendered by SessionView, this class is Used to
  # manage the events in the users.
  SessionUsersView = Backbone.View.extend
    events:
      "click #switch-presenter": "_switchPresenter"
      "click .user": "_userClicked"

    initialize: ->
      @userListID = "#current-users"

      # Bind to the event triggered when the client connects to the server
      globals.connection.bind "connection:connected",
        @_registerConnectionEvents, @

    render: ->
      compiledTemplate = _.template(sessionUsersTemplate)
      @$el.html compiledTemplate

    # Registers listeners for events in the application socket.
    _registerConnectionEvents: ->
      socket = globals.connection.socket

      # Received event for a new public chat message
      # @param  {Array} users Array of names and publicIDs of connected users
      socket.on "user list change", (users) =>
        @_removeAllUsers()
        for userBlock in users
          @_addUser(userBlock.id, userBlock.name)

      socket.on "load users", (users) =>
        @_removeAllUsers()
        for userBlock in users
          @_addUser(userBlock.id, userBlock.name)

      # Received event for a new user
      socket.on "user join", (userid,username) =>
        #@_removeAllUsers()
        #for userBlock in users
        @_addUser(userid, username)

      # Received event when a user leave
      socket.on "user leave", (userid) =>
        #@_removeAllUsers()
        #for userBlock in users
        @_removeUserByID(userid)

      # Received event to set the presenter to a user
      # @param  {string} userID publicID of the user that is being set as the current presenter
      socket.on "setPresenter", (userID) =>
        @_setPresenter(userID)

    # Removes all users from the screen.
    _removeAllUsers: ->
      @$(@userListID).empty()

    # Removes all users from the screen.
    _removeUserByID: (userID)->
      @$("#user-"+userID).remove()

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

      # add .selected to the user's element
      $target = @$(e.target)
      unless $target.hasClass('user') # clicked on a child
        $target = $target.parents('.user')
      $target.addClass('selected')

    # Sets the current presenter to the user currently selected.
    _switchPresenter: ->
      id = @$(".user.selected").attr("id").replace("user-", "")
      globals.connection.emitSetPresenter id

    # Sets the user with ID `userID` as the presenter.
    _setPresenter: (userID) ->
      @$(".user.presenter").removeClass "presenter"
      @$("#user-#{userID}").addClass "presenter"

  SessionUsersView
