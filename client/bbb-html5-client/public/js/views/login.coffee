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

    render: ->
      # At first we render a simple "loading" page while we check if the
      # user is authenticated or not
      compiledTemplate = _.template(loginLoadingTemplate, {})
      @$el.html compiledTemplate
      # Go check the authentication

      # TODO: check if the user's browser supports websockets
      # @_browserSupportsWebSockets()

      # Connect to the server and authenticate the user
      globals.connection.connect()
      @_authenticate()

    # Fetch information from the server to check if the user is autheticated
    # already or not. If not, authenticates the user.
    _authenticate: ->
      console.log "Authenticating user"
      @model.authenticate (err, data) =>
        if not err? and data.payload?.valid
          console.log "User authenticated successfully"
          @_onLoginAccepted()
        else
          console.log "User not authorized:", data, err
          @_renderAuthenticationError()

    _renderAuthenticationError: ->
      # TODO: render a page showing the authentication error

    # Actions to take when the login was authorized.
    _onLoginAccepted: ->
      globals.currentAuth = @model
      globals.router.showSession()

    # Checks if browser support websockets
    _browserSupportsWebSockets: ->
      if window.WebSocket?
        true
      else
        alert("Websockets is not supported by your current browser")
        false

  LoginView
