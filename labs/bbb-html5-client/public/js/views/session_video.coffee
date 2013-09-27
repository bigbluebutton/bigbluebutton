define [
  'jquery',
  'underscore',
  'backbone',
  'globals',
  'text!templates/session_video.html',
], ($, _, Backbone, globals, sessionVideoTemplate) ->

  # The video in a session
  SessionVideoView = Backbone.View.extend

    render: ->
      data = { auth: globals.currentAuth }
      compiledTemplate = _.template(sessionVideoTemplate, data)
      @$el.html compiledTemplate


  SessionVideoView
