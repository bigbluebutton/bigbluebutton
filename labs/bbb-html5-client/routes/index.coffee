exec = require("child_process").exec
fs = require("fs")
imagemagick = require("imagemagick")
sanitizer = require("sanitizer")
util = require("util")

config = require("../config")
routes = require("../routes")

###
This returns the folder where the presentation files will be
stored for that particular presentationID.
@param  {string} presentationID the presentationID being looked up for a folder
@return {string}                the relative URL for where the images will be stored
###

#exports.presentationImageFolder = function(presentationID) {
#return 'public/images/presentation' + presentationID;
#return 'public/images/presentations/'+presentationID;
#};
exports.presentationImageFolder = (meetingID, presentationID) ->
  "/var/bigbluebutton/" + meetingID + "/" + meetingID + "/" + presentationID + "/pngs"

###
When  requesting the homepage a potential meetingID and sessionIDare extracted
from the user's cookie. If they match with a user that is in the databaseunder
the same data, they are instantly redirected to join into the meeting.
If they are not, they will be redirected to the index page where they can enter
their login details.
@param  {Object} req Request object from the client
@param  {Object} res Response object to the client
@return {undefined}  Response object is sent back to the client.
###
exports.get_index = (req, res) ->
  config.redisAction.getMeetings (meetings) ->
    res.render "index",
      title: "BigBlueButton HTML5 Client"
      meetings: meetings

###
Given a meetingID, sessionID and username a meeting will be created
and a user with the username will be joined.The callback returns either true or false depending on whether
the meeting was created successfully or not.
@param  {string}   meetingID the meeting ID of the meeting we are creating and/or connecting to
@param  {string}   sessionID the session ID of the user that is connecting to the meeting
@param  {string}   username  username of the users that that is connecting to the meeting
@param  {Function} callback  the callback function returns true if meeting successfully started and joined, false otherwise
@return {undefined}          callback is used to send the status back to the caller of this function
###
makeMeeting = (meetingID, sessionID, username, callback) ->
  if (username) and (meetingID) and (username.length <= config.maxUsernameLength) and (meetingID.split(" ").length is 1)
    publicID = (new Date()).getTime()
    config.redisAction.isMeetingRunning meetingID, (isRunning) ->
      unless isRunning
        config.redisAction.createMeeting meetingID, ->
          config.redisAction.setCurrentTool meetingID, "line"
          config.redisAction.setPresenter meetingID, sessionID, publicID

    config.redisAction.createUser meetingID, sessionID
    config.store.get config.redisAction.getCurrentPresentationString(meetingID), (err, currPresID) ->
      unless currPresID
        config.redisAction.createPresentation meetingID, true, (presentationID) ->
          config.redisAction.createPage meetingID, presentationID, "default.png", true, (pageID) ->
            config.redisAction.setViewBox meetingID, JSON.stringify([0, 0, 1, 1])
            folder = routes.presentationImageFolder(meetingID, presentationID)
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

###
Upon submitting their login details from the index page via a POST request,
a meeting will be created and joined. If an error occurs, which usually
results in using a username/meetingID that is too long, the user receives
an error response. Both success and error responses are in json only.
@param  {Object} req Request object from the client
@param  {Object} res Response object to the client
@return {undefined}  Response object is sent back to the client.
###
exports.post_auth = (req, res) ->
  user = req.body
  username = sanitizer.escape(user.username)
  meetingID = sanitizer.escape(user.meetingID)
  sessionID = req.sessionID
  makeMeeting meetingID, sessionID, username, (join) ->
    user.meetingID = meetingID
    user.username = username
    res.contentType "json"
    if join
      res.cookie "sessionid", sessionID #save the id so socketio can get the username
      res.cookie "meetingid", meetingID
      user.loginAccepted = true
      res.send user
    else
      user.loginAccepted = false
      res.send user

###
Returns a json informing if there's an authenticated user or not.
The  meetingID and sessionID are extracted from the user's cookie.
If they match with a user that is in the database, the user is
accepted and his information is included in the response. If they don't
match, the user is not accepted.
@param  {Object} req Request object from the client
@param  {Object} res Response object to the client
@return {undefined}  Response object is sent back to the client.
###
exports.get_auth = (req, res) ->
  config.redisAction.isValidSession req.cookies.meetingid, req.cookies.sessionid, (valid) ->
    res.contentType "json"
    unless valid
      user = {}
      user.loginAccepted = false
      res.send user
    else
      user = {}
      user.loginAccepted = true
      user.meetingID = req.cookies.meetingid

      # user.username = ?? // TODO
      res.send user

###
When a user logs out, their session is destroyed,
and their cookies are cleared.
@param  {Object} req Request object from the client
@param  {Object} res Response object to the client
@return {undefined}  Response object is sent back to the client.
###
exports.logout = (req, res) ->
  req.session.destroy() #end the session
  res.cookie "sessionid", null #clear the cookie from the client
  res.cookie "meetingid", null
  res.redirect "/"

###
The join URL is used to connect to a meeting immediately without
going to the login screen.
Example:
localhost:3000/join?meetingid=123&fullname=Ryan&checksum=password
This will connect under the meetingID 123 with the name "Ryan" as
long as the checksum string is equal on the server side.
@param  {Object} req Request object from the client
@param  {Object} res Response object to the client
@return {undefined}  Response object is sent back to the client.
###
exports.join = (req, res) ->
  query = req.query
  if query
    meetingID = query.meetingid
    username = query.fullname
    checksum = query.checksum
    sessionID = req.sessionID

    # checksum is checked here against a simple keyword for now
    if checksum is "password"

      #create meeting
      makeMeeting meetingID, sessionID, username, (join) ->

        #if the meeting was created successfully
        if join

          #store the cookies
          res.cookie "sessionid", sessionID #save the id so socketio can get the username
          res.cookie "meetingid", meetingID
        res.redirect "/"

    else
      res.redirect "/"

###
POSTing a file from the client page, the images will be
converted and their URLs will be send via SocketIO if
successful. If unsuccessful, a status of failed will be sent.
@param  {Object}   req  Request object from the client
@param  {Object}   res  Response object to the client
@return {undefined}     Response object is sent back to the client.
###
exports.post_upload = (req, res) ->

  # the client must send a file
  if req.files.image.size isnt 0
    meetingID = req.cookies.meetingid
    sessionID = req.cookies.sessionid
    config.redis.pub.publish meetingID, JSON.stringify(["uploadStatus", "Processing..."])
    config.redisAction.isValidSession meetingID, sessionID, (reply) ->
      file = req.files.image.path
      pageIDs = []
      config.redisAction.getCurrentPresentationID meetingID, (prevPresID) ->
        config.redisAction.getCurrentPageID meetingID, prevPresID, (prevPageID) ->
          config.redisAction.createPresentation meetingID, false, (presentationID) ->
            config.redisAction.setViewBox meetingID, JSON.stringify([0, 0, 1, 1])
            folder = routes.presentationImageFolder(meetingID, presentationID)

            #make the directory the presentation files will go into.
            fs.mkdir folder, 0o0777, (reply) ->

              # ImageMagick call to convert file to PNG images named slide0.png, slide1.png, slide2.png, etc...
              imagemagick.convert ["-quality", "50", "-density", "150x150", file, folder + "/slide%d.png"], (err) ->
                unless err

                  #counts how many files are in the folder for the presentation to get the slide count.
                  exec "ls -1 " + folder + "/ | wc -l", (error, stdout, stdouterr) ->
                    numOfPages = parseInt(stdout, 10)
                    numComplete = 0

                    # interate through each of the files and create a page for each of them.
                    i = 0

                    while i < numOfPages
                      setCurrent = true
                      setCurrent = false  if i isnt 0
                      config.redisAction.createPage meetingID, presentationID, "slide" + i + ".png", setCurrent, (pageID, imageName) ->

                        #ImageMagick call to get the image size from each of the converted images.
                        imagemagick.identify folder + "/" + imageName, (err, features) ->
                          if err
                            throw err
                          else
                            config.redisAction.setImageSize meetingID, presentationID, pageID, features.width, features.height, ->
                              pageIDs.push pageID
                              numComplete++
                              if numComplete is numOfPages

                                # Once complete, set the current presentation to the new one
                                # and publish the new slides to all members of the meeting.
                                config.redisAction.setCurrentPresentation meetingID, presentationID, ->
                                  config.redis.pub.publish meetingID, JSON.stringify(["clrPaper"])
                                  config.socketAction.publishSlides meetingID, null, ->
                                    config.socketAction.publishViewBox meetingID
                                    config.redis.pub.publish meetingID, JSON.stringify(["uploadStatus", "Upload succeeded", true])

                      i++

                else
                  console.log err
                  fs.rmdir folder, ->
                    console.log "Deleted invalid presentation folder"
                    config.redis.pub.publish meetingID, JSON.stringify(["uploadStatus", "Invalid file", true])

  # TODO: return a json indicating success/failure
  res.redirect "/"

###
Any other page that we have not defined yet.
@param  {Object} req Request object from the client
@param  {Object} res Response object to the client
@return {undefined}  Response object is sent back to the client.
###
exports.error404 = (req, res) ->
  console.log "User tried to access: " + req.url
  res.send "Page not found", 404

###
@param  {Object} req Request object from the client
@param  {Object} res Response object to the client
@return {undefined}  Response object is sent back to the client.
###
exports.meetings = (req, res) ->
  config.redisAction.getMeetings (results) ->
    res.contentType "json"
    res.send JSON.stringify(results)
