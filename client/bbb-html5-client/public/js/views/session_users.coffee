define [
  'jquery',
  'underscore',
  'backbone',
  'globals',
  'cs!collections/users',
  'text!templates/session_users.html',
  'text!templates/user.html'
], ($, _, Backbone, globals, UserCollection, sessionUsersTemplate, userTemplate) ->

  # The users panel in a session
  # The contents are rendered by SessionView, this class is Used to
  # manage the events in the users.
  SessionUsersView = Backbone.View.extend
    model: new UserCollection()
    
    events:
      "click #switch-presenter": "_switchPresenter"
      "click .user": "_userClicked"

    initialize: ->
      userListID = "#user-list"
      @model.start()
      @users = null
      
      # Bind to the event triggered when the client connects to the server
      if globals.connection.isConnected()
        @_registerEvents()
      else
        globals.events.on "connection:connected", =>
          @_registerEvents()

    render: ->
      # this renders to unordered list where users will be appended to
      compiledTemplate = _.template(sessionUsersTemplate)
      @$el.html compiledTemplate
      
    # Registers listeners for events in the event bus.
    # TODO: bind to backbone events in UserCollection such as 'user added', 'user removed'
    _registerEvents: ->

      globals.events.on "users:user_list_change", (users) =>
        @_removeAllUsers()
        for userBlock in users
          console.log("on user_list_change; adding user:" + JSON.stringify userBlock)
          @_addUser(userBlock.id, userBlock.name)

      #globals.events.on "receiveUsers", (data) =>
        #@users = data

      globals.events.on "users:load_users", (users) =>
        @_removeAllUsers()
        for userBlock in users
          #@_addUser(userBlock.userid, userBlock.name)
          globals.events.trigger "user:add_new_user", {id: userBlock.userid, userid: userBlock.userid, username: userBlock.name}

      globals.events.on "users:user_join", (userid, username) =>
        #@_addUser(userid, username)
        console.log "fffffffffffffff"
        globals.events.trigger "user:add_new_user", {id: userid, userid: userid, username: username}

      globals.events.on "users:user_left", (userid) =>
        @_removeUserByID(userid)

      globals.events.on "users:setPresenter", (userid) =>
        @_setPresenter(userid)

    # Removes all users from the screen.
    _removeAllUsers: ->
      @$(@userListID).empty()

    # Removes all a user from the list #TODO - for now it does not remove but moves to the left hand side
    _removeUserByID: (userID)->
      @$("#user-"+userID).remove()

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
