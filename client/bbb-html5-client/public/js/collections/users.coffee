define [
  'underscore',
  'backbone',
  'globals',
  'cs!models/user'
], (_, Backbone, globals, UserModel) ->

  UsersCollection = Backbone.Collection.extend
    model: UserModel

    initialize: ->

    start: ->
      # TODO: this should be in `initialize`, but can't be right now because
      #       globals.connection doesn't exist yet
      # Bind to the event triggered when the client connects to the server
      if globals.connection.isConnected()
        @_registerEvents()
      else
        globals.events.on "connection:connected", =>
          @_registerEvents()

    _registerEvents: ->

      globals.events.on "connection:load_users", (users) =>
        #alert "load users"
        for userBlock in users
          @add [
            new UserModel {id: userBlock.id, userid: userBlock.id, username: userBlock.name}
          ]
        globals.events.trigger("users:load_users", users)

      #globals.events.on "getUsers", =>
        #users = @toJSON()
        #globals.events.trigger("receiveUsers", users)      

      globals.events.on "connection:user_join", (newUserid, newUsername) =>
        unless @get(newUserid)? #check if the user is already present
          #newUser = new UserModel {id: newUserid, userid: newUserid, username: newUsername}
          newUser = new UserModel() 
          newUser.id = newUserid
          newUser.userid = newUserid
          newUser.username = newUsername

          @add [
            newUser
          ]
          globals.events.trigger("user:add_new_user", newUser)

      globals.events.on "connection:user_left", (userid) =>
        toDel = @get(userid)
        if toDel? # only remove if the user model was found
          @remove(toDel)
          globals.events.trigger("users:user_left", userid)

      globals.events.on "connection:setPresenter", (userid) =>
        globals.events.trigger("users:setPresenter", userid)

      render: ->
        alert "user collection rendering"

  UsersCollection
