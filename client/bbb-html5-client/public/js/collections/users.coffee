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

      globals.events.on "connection:user_list_change", (users) =>
        globals.events.trigger("users:user_list_change", users)

      globals.events.on "connection:load_users", (users) =>
        for userBlock in users
          @add [
            id : userBlock.id
            userid: userBlock.id
            username: userBlock.name
          ]
        globals.events.trigger("users:load_users", users)

      globals.events.on "connection:user_join", (userid, username) =>
        console.log "users.coffee: on(connection:user_join)" + username
        @add [
          id : userid
          userid: userid
          username: username
        ]
        globals.events.trigger("users:user_join", userid, username)

      globals.events.on "connection:user_leave", (userid) =>
        toDel = @get(userid)
        @remove(toDel)
        globals.events.trigger("users:user_leave", userid)

      globals.events.on "connection:user_left", (userid) =>
        toDel = @get(userid)
        @remove(toDel)
        globals.events.trigger("users:user_left", userid)

      globals.events.on "connection:setPresenter", (userid) =>
        globals.events.trigger("users:setPresenter", userid)

  UsersCollection
