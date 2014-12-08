define [
  'underscore',
  'backbone',
  'globals'
], (_, Backbone, globals) ->

  # TODO: this class should actually store ChatModel's, for now it is only trigerring events
  ChatModel = Backbone.Model.extend

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

      globals.events.on "connection:msg", (name, msg) =>
        globals.events.trigger("chat:msg", name, msg)

      globals.events.on "connection:all_messages", (data) ->
        console.log 'globals.events.on "connection:all_messages", (data) =>' + JSON.stringify data
        globals.events.trigger("chat:all_messages", data)

  ChatModel
