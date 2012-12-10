define [
  'jquery',
  'underscore',
  'backbone',
  'globals',
  'cs!models/authentication',
  'cs!collections/meetings',
  'text!templates/login.html'
], ($, _, Backbone, globals, AuthenticationModel, MeetingsCollection, loginTemplate) ->

  LoginView = Backbone.View.extend
    id: 'login-view'
    model: new AuthenticationModel()

    events:
      "submit #login-form": "doLogin"

    render: ->
      # if the data was rendered in the page, use it, otherwise fetch it
      if globals.bootstrappedMeetings
        collection = new MeetingsCollection(globals.bootstrappedMeetings)
      else
        # TODO: test it
        collection = new MeetingsCollection()
        collection.fetch()

      data = { meetings: collection.models }
      compiledTemplate = _.template(loginTemplate, data)
      this.$el.html compiledTemplate
      this

    doLogin: ->
      app = require 'cs!app'
      params =
        "username": this.$el.find("#user-name").val()
        "meetingID": this.$el.find("#meeting-id").val()
      @model.save params,
        success: =>
          globals.router.navigate "/session", {trigger: true, replace: true}
        error: =>
          console.log "authentication error"
          # TODO: show the error in the screen
          globals.router.navigate "/login", {trigger: true, replace: true}
      false

  LoginView
