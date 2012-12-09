define [
  'jquery',
  'underscore',
  'backbone',
  'configs',
  'cs!models/authentication',
  'cs!collections/meetings',
  'text!templates/login.html'
], ($, _, Backbone, configs, AuthenticationModel, MeetingsCollection, loginTemplate) ->

  LoginView = Backbone.View.extend
    id: 'login-view'
    model: new AuthenticationModel()

    events:
      "submit #login-form": "doLogin"

    render: ->
      # if the data was rendered in the page, use it, otherwise fetch it
      if configs.bootstrappedMeetings
        collection = new MeetingsCollection(configs.bootstrappedMeetings)
      else
        # TODO: test it
        collection = new MeetingsCollection()
        collection.fetch()

      data = { meetings: collection.models }
      compiledTemplate = _.template(loginTemplate, data)
      this.$el.html compiledTemplate
      this

    doLogin: ->
      params =
        "username": this.$el.find("#user-name").val()
        "meetingID": this.$el.find("#meeting-id").val()
      @model.save params,
        success: =>
          configs.router.navigate "/session", {trigger: true, replace: true}
        error: =>
          console.log "authentication error"
          # TODO: show the error in the screen
          configs.router.navigate "/login", {trigger: true, replace: true}
      false

  LoginView
