define [
  'jquery',
  'underscore',
  'backbone',
  'globals',
  'cs!collections/users',
  'text!templates/session_users.html',
  'text!templates/user.html',
  'text!templates/users_table.html'
], ($, _, Backbone, globals, UserCollection, sessionUsersTemplate, userTemplate,tableTemplate) ->

  # The users panel in a session
  # The contents are rendered by SessionView, this class is Used to
  # manage the events in the users.
  SessionUsersView = Backbone.View.extend
    model: new UserCollection()

    events:
      "click #switch-presenter": "_switchPresenter"
      "click .user": "_userClicked"

    initialize: ->
      @userListID = "#current-users"
      @model.start()


      # Bind to the event triggered when the client connects to the server
      if globals.connection.isConnected()
        @_registerEvents()
      else
        globals.events.on "connection:connected", =>
          @_registerEvents()

    render: ->
      compiledTemplate = _.template(sessionUsersTemplate)
      @$el.html compiledTemplate

    # Registers listeners for events in the event bus.
    # TODO: bind to backbone events in UserCollection such as 'user added', 'user removed'
    _registerEvents: ->

      globals.events.on "users:user_list_change", (users) =>
        @_removeAllUsers()
        for userBlock in users
          @_addUser(userBlock.id, userBlock.name)

      globals.events.on "users:load_users", (users) =>
        @_removeAllUsers()
        compiledTemplate = _.template(tableTemplate)
        @$(@userListID).append compiledTemplate
        for userBlock in users
          @_addUser(userBlock.id, userBlock.name)

      globals.events.on "users:user_join", (userid, username) =>
        #@_removeAllUsers()
        #for userBlock in users
        @_addUser(userid, username)

      globals.events.on "users:user_leave", (userid) =>
        #@_removeAllUsers()
        #for userBlock in users
        @_removeUserByID(userid)

      globals.events.on "users:setPresenter", (userid) =>
        @_setPresenter(userid)

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
      #@$(@userListID).append compiledTemplate
      $('#usertable').append compiledTemplate
      
      
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
      console.log "change a new presenter"
      id = @$(".user.selected").attr("id").replace("user-", "")
      globals.connection.emitSetPresenter id

    # Sets the user with ID `userID` as the presenter.
    _setPresenter: (userID) ->
      @$(".user.presenter").removeClass "presenter"
      @$("#user-#{userID}").addClass "presenter"
        
      
  SessionUsersView
