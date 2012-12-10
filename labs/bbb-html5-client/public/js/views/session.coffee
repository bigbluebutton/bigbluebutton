define [
  'jquery',
  'underscore',
  'backbone',
  'globals',
  'text!templates/session.html'
], ($, _, Backbone, globals, sessionTemplate) ->

  SessionView = Backbone.View.extend
    id: 'session-view'

    render: ->
      data = {}
      compiledTemplate = _.template(sessionTemplate, data)
      this.$el.append compiledTemplate

      # Connect to the server
      globals.connection.connect()

      this

  SessionView
