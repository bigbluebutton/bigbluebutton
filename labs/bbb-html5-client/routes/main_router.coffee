fs = require("fs")
sanitizer = require("sanitizer")
util = require("util")

config = require("../config")
RedisKeys = require("../lib/redis_keys")

# The main router that registers the routes that can be accessed by the client.
module.exports = class MainRouter
  constructor: (@app) ->
    @_registerRoutes()

  _registerRoutes: () ->
    @app.get "/", @_index
    @app.get "/auth", @_getAuth
    @app.post "/auth", @_postAuth
    @app.post "/logout", requiresLogin, @_logout
    @app.get "/meetings", @_meetings

  # When  requesting the homepage a potential meetingID and sessionID are extracted
  # from the user's cookie. If they match with a user that is in the database under
  # the same data, they are instantly redirected to join into the meeting.
  # If they are not, they will be redirected to the index page where they can enter
  # their login details.
  _index: (req, res) ->
    config.redisAction.getMeetings (meetings) ->
      res.render "index",
        title: "BigBlueButton HTML5 Client"
        meetings: meetings

  # Upon submitting their login details from the index page via a POST request,
  # a meeting will be created and joined. If an error occurs, which usually
  # results in using a username/meetingID that is too long, the user receives
  # an error response. Both success and error responses are in json only.
  _postAuth: (req, res) ->
    user = req.body
    username = sanitizer.escape(user.username)
    meetingID = sanitizer.escape(user.meetingID)
    sessionID = req.sessionID
    makeMeeting meetingID, sessionID, username, (result) ->
      user.meetingID = meetingID
      user.username = username
      res.contentType "json"
      if result
        res.cookie "sessionid", sessionID # save the id so socketio can get the username
        res.cookie "meetingid", meetingID
        user.loginAccepted = true
        res.send(user)
      else
        user.loginAccepted = false
        res.send(user)

  # Returns a json informing if there's an authenticated user or not. The meetingID and
  # sessionID are extracted from the user's cookie. If they match with a user that is
  # in the database, the user is accepted and his information is included in the response.
  # If they don't match, the user is not accepted.
  _getAuth: (req, res) ->
    config.redisAction.isValidSession req.cookies["meetingid"], req.cookies["sessionid"], (valid) ->
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
  _logout: (req, res) ->
    req.session.destroy() # end the session
    res.cookie "sessionid", null # clear the cookie from the client
    res.cookie "meetingid", null
    res.redirect "/"

  # @param  {Object} req Request object from the client
  # @param  {Object} res Response object to the client
  _meetings: (req, res) ->
    config.redisAction.getMeetings (results) ->
      res.contentType "json"
      res.send JSON.stringify(results)


# If a page requires authentication to view, this function is used to verify that there
# is a user logged in.
# @param  {Object}   req   Request object from client
# @param  {Object}   res   Response object to client
# @param  {Function} next  To be run as a callback if valid
requiresLogin = (req, res, next) ->
  # check that they have a cookie with valid session id
  config.redisAction.isValidSession req.cookies["meetingid"], req.cookies["sessionid"], (isValid) ->
    if isValid
      next()
    else
      res.redirect "/"

# Given a meetingID, sessionID and username a meeting will be created and a user with the
# given username will be joined. The callback indicates either true or false depending on whether
# the meeting was created successfully or not.
# @param  {string}   meetingID the meeting ID of the meeting we are creating and/or connecting to
# @param  {string}   sessionID the session ID of the user that is connecting to the meeting
# @param  {string}   username  username of the users that that is connecting to the meeting
# @param  {Function} callback  the callback function returns true if meeting successfully started and joined, false otherwise
# TODO: move to another class in lib/ maybe?
# TODO: the callbacks are not all nested as they should
makeMeeting = (meetingID, sessionID, username, callback) ->
  if (username) and (meetingID) and (username.length <= config.maxUsernameLength) and (meetingID.split(" ").length is 1)
    publicID = (new Date()).getTime()
    config.redisAction.isMeetingRunning meetingID, (isRunning) ->
      unless isRunning
        config.redisAction.createMeeting meetingID, ->
          config.redisAction.setCurrentTool meetingID, "line"
          config.redisAction.setPresenter meetingID, sessionID, publicID

    config.redisAction.createUser meetingID, sessionID
    config.store.get RedisKeys.getCurrentPresentationString(meetingID), (err, currPresID) ->
      unless currPresID
        config.redisAction.createPresentation meetingID, true, (presentationID) ->
          config.redisAction.createPage meetingID, presentationID, "default.png", true, (pageID) ->
            config.redisAction.setViewBox meetingID, JSON.stringify([0, 0, 1, 1])
            folder = config.presentationImageFolder(meetingID, presentationID)
            fs.mkdir folder, 0o0777, (reply) ->
              newFile = fs.createWriteStream(folder + "/default.png")
              oldFile = fs.createReadStream("images/default.png")
              newFile.once "open", (fd) ->
                util.pump oldFile, newFile
                config.redisAction.setImageSize meetingID, presentationID, pageID, 800, 600

    config.redisAction.setIDs meetingID, sessionID, publicID, ->
      config.redisAction.updateUserProperties meetingID, sessionID, ["username", username, "meetingID", meetingID, "refreshing", false, "dupSess", false, "sockets", 0, "pubID", publicID]
      callback?(true)

  else
    callback?(false)
