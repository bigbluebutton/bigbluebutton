define [
  'jquery',
  'underscore',
  'backbone',
  'text!templates/session.html'
], ($, _, Backbone, sessionTemplate) ->

  SessionView = Backbone.View.extend
    id: '#session-view'

    render: ->
      data = {}
      compiledTemplate = _.template(sessionTemplate, data)
      this.$el.append compiledTemplate
      this

  SessionView
