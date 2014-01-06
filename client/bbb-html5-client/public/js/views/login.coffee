define [
  'jquery',
  'underscore',
  'backbone',
  'globals',
  'cs!models/authentication',
  'cs!collections/meetings',
  'text!templates/login.html',
  'text!templates/login_loading.html',
], ($, _, Backbone, globals, AuthenticationModel, MeetingsCollection, loginTemplate, loginLoadingTemplate) ->

  LoginView = Backbone.View.extend
    id: 'login-view'
    model: new AuthenticationModel()

    events:
      "submit #login-form": "_onLoginFormSubmit"
      

    render: ->
      # At first we render a simple "loading" page while we check if the
      # user is authenticated or not
      compiledTemplate = _.template(loginLoadingTemplate, {})
      @$el.html compiledTemplate
      # Go check the authentication
      @_checkAuthentication()

    # Method to render the template with the inputs that the user can
    # use to log in.
    _renderLoginFields: ->
      # if the data was rendered in the page, use it, otherwise fetch it
      if globals.bootstrappedMeetings
        collection = new MeetingsCollection(globals.bootstrappedMeetings)
      else
        # TODO: test it
        collection = new MeetingsCollection()
        collection.fetch()

      data = { meetings: collection.models }
      compiledTemplate = _.template(loginTemplate, data)
      @$el.html compiledTemplate

    # Fetch information from the server to check if the user is autheticated
    # already or not.
    _checkAuthentication: ->
      @model.fetch
        success: (model, response, options) =>
          if @model.get("loginAccepted")
            @_onLoginAccepted()
          else
            @_renderLoginFields()
        error: (model, xhr, options) =>
          console.log "Unexpected error fetching authentication data:", model, xhr, options
          @_renderLoginFields()

    # Triggered when the login form is submitted.
    _onLoginFormSubmit: ->
      return unless @_validateForm() and @_browserSupportsWebSockets()

      params =
        "username": @$("#user-name").val()
        "meetingID": @$("#meeting-id").val()
      @model.save params,
        success: (model, response, options) =>
          if @model.get("loginAccepted")
            @_onLoginAccepted()
          else
            # TODO: show the error in the screen
            globals.router.showLogin()
        error: (model, xhr, options) =>
          console.log "Unexpected error fetching authentication data:", model, xhr, options
          # TODO: show the error in the screen
          globals.router.showLogin()
      false

    # Actions to take when the login was authorized.
    _onLoginAccepted: ->
      globals.currentAuth = @model
      globals.router.showSession()

    #Checks if browser support websockets
    _browserSupportsWebSockets: ->
      if window.WebSocket?
        true
      else
        alert("Websockets is not supported by your current browser")
        false

    # Checks if the login form is valid. If not, shows an alert.
    _validateForm: ->
      name = @$("#user-name").val()
      meeting = @$("#meeting-id").val()
      if not name? or name.trim() is ""
        alert "Please enter a username"
        false
      else if not meeting? or meeting.trim() is ""
        alert "Please select a meeting"
        false
      else
        true
       
  LoginView
