define [
  'jquery',
  'underscore',
  'backbone',
  'text!templates/session.html',
  'cs!chat/connection',
  'cs!chat/whiteboard',
  'cs!chat/chat',
  'cs!chat/behaviour'
], ($, _, Backbone, sessionTemplate) ->

  SessionView = Backbone.View.extend
    id: 'session-view'

    render: ->
      data = {}
      compiledTemplate = _.template(sessionTemplate, data)
      this.$el.append compiledTemplate
      this

  SessionView
