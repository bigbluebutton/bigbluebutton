define [
  'underscore',
  'backbone',
  'globals',
  'cs!models/user'
], (_, Backbone, globals, UserModel) ->

  # TODO: this class should actually store UserModel's, for now it is only trigerring events
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

      #globals.events.on "connection:user_list_change", (users) =>
      #  globals.events.trigger("users:user_list_change", users)

      globals.events.on "connection:load_users", (users) =>
        for userBlock in users
          @add [
            new UserModel {id: userBlock.id, userid: userBlock.id, username: userBlock.name}
          ]
          alert "onload "+@length
        globals.events.trigger("users:load_users", users)

      globals.events.on "connection:user_join", (userid, username) =>
        users = @toJSON()
        alert ("sending users: " + users)
        globals.events.trigger("there_you_go", users)

        unless @get(userid)? #check if the user is already present
          @add [
            new UserModel {id: userid, userid: userid, username: username}
          ]
          alert "on join "+@length
          globals.events.trigger("users:user_join", userid, username)

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
