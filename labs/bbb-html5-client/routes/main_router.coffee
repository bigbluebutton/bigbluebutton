fs = require("fs")
sanitizer = require("sanitizer")
util = require("util")

config = require("../config")
RedisKeys = require("../lib/redis_keys")

moduleDeps = ["App", "RedisAction", "RedisStore"]

# The main router that registers the routes that can be accessed by the client.
module.exports = class MainRouter

  constructor: () ->
    config.modules.wait moduleDeps, =>
      @app = config.modules.get("App")
      @redisAction = config.modules.get("RedisAction")
      @redisStore = config.modules.get("RedisStore")
      @_registerRoutes()

  _registerRoutes: () ->
    @app.get "/", @_index
    @app.get "/auth", @_getAuth
    @app.post "/auth", @_postAuth
    @app.post "/logout", @_requiresLogin, @_logout
    @app.get "/meetings", @_meetings

  # When  requesting the homepage a potential meetingID and sessionID are extracted
  # from the user's cookie. If they match with a user that is in the database under
  # the same data, they are instantly redirected to join into the meeting.
  # If they are not, they will be redirected to the index page where they can enter
  # their login details.
  #
  # This method is registered as a route on express.
  #
  # @internal
  _index: (req, res) =>
    @redisAction.getMeetings (err, meetings) ->
      res.render "index",
        title: config.appName
        meetings: meetings

  # Upon submitting their login details from the index page via a POST request, a meeting
  # will be created and joined. If an error occurs, which usually results in using an
  # invalid username or meetingID, the user receives an error response. Both success and
  # error responses are in json only.
  #
  # This method is registered as a route on express.
  #
  # @internal
  _postAuth: (req, res) =>
    user = req.body
    username = user.username = sanitizer.escape(user.username)
    meetingID = user.meetingID = sanitizer.escape(user.meetingID)
    sessionID = req.sessionID

    validParameters = @_validateLoginParameters username, meetingID

    if validParameters
      @redisAction.makeMeeting meetingID, sessionID, username, (result) ->
        user.loginAccepted = result
        # save the ids so socketio can get the username and meeting
        if result
          res.cookie "sessionid", sessionID
          res.cookie "meetingid", meetingID
        res.contentType "json"
        res.send(user)
    else
      user.loginAccepted = false
      res.send(user)

  # Returns a json informing if there's an authenticated user or not. The meetingID and
  # sessionID are extracted from the user's cookie. If they match with a user that is
  # in the database, the user is accepted and his information is included in the response.
  # If they don't match, the user is not accepted.
  #
  # This method is registered as a route on express.
  #
  # @internal
  _getAuth: (req, res) =>
    @redisAction.isValidSession req.cookies["meetingid"], req.cookies["sessionid"], (err, valid) ->
      res.contentType "json"
      user = {}
      unless valid
        user.loginAccepted = false
        res.send user
      else
        user.loginAccepted = true
        user.meetingID = req.cookies.meetingid
        # user.username = ?? // TODO
        res.send user

  # When a user logs out, their session is destroyed and their cookies are cleared.
  # @param  {Object} req Request object from the client
  # @param  {Object} res Response object to the client
  #
  # This method is registered as a route on express.
  #
  # @internal
  _logout: (req, res) =>
    req.session.destroy() # end the session
    res.cookie "sessionid", null # clear the cookie from the client
    res.cookie "meetingid", null
    res.redirect "/"

  # @param  {Object} req Request object from the client
  # @param  {Object} res Response object to the client
  #
  # This method is registered as a route on express.
  #
  # @internal
  _meetings: (req, res) =>
    @redisAction.getMeetings (err, results) ->
      res.contentType "json"
      res.send JSON.stringify(results)

  # If a page requires authentication to view, this function is used to verify that there
  # is a user logged in.
  # @param  {Object}   req   Request object from client
  # @param  {Object}   res   Response object to client
  # @param  {Function} next  To be run as a callback if valid
  #
  # This method is registered as a route on express.
  #
  # @internal
  _requiresLogin: (req, res, next) =>
    # check that they have a cookie with valid session id
    @redisAction.isValidSession req.cookies["meetingid"], req.cookies["sessionid"], (err, isValid) ->
      if isValid
        next()
      else
        res.redirect "/"

  # Checks whether the parameters passed by the user to login are correct
  # @param username [string] the username passed by the user
  # @param meetingID [string] the meetingID passed by the user
  # @return [boolean] whether the parameters are correct or not
  # @internal
  _validateLoginParameters: (username, meetingID) ->
    username? and meetingID? and
      username.length <= config.maxUsernameLength and
      meetingID.split(" ").length is 1
