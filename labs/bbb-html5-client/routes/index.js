/**
 * This returns the folder where the presentation files will be
 * stored for that particular presentationID.
 * @param  {string} presentationID the presentationID being looked up for a folder
 * @return {string}                the relative URL for where the images will be stored
 */
//exports.presentationImageFolder = function(presentationID) {
  //return 'public/images/presentation' + presentationID;
  //return 'public/images/presentations/'+presentationID;
//};
exports.presentationImageFolder = function(meetingID,presentationID) {
  return '/var/bigbluebutton/' + meetingID + "/" + meetingID + "/" + presentationID + "/pngs";
};

/**
 * When  requesting the homepage a potential meetingID and sessionIDare extracted
 * from the user's cookie. If they match with a user that is in the databaseunder
 * the same data, they are instantly redirected to join into the meeting.
 * If they are not, they will be redirected to the index page where they can enter
 * their login details.
 * @param  {Object} req Request object from the client
 * @param  {Object} res Response object to the client
 * @return {undefined}  Response object is sent back to the client.
 */
exports.get_index = function(req, res) {
  redisAction.getMeetings(function (meetings){
    res.render('index', { title: 'BigBlueButton HTML5 Client', meetings: meetings });
  });
};

/**
 * Given a meetingID, sessionID and username a meeting will be created
 * and a user with the username will be joined.The callback returns either true or false depending on whether
 * the meeting was created successfully or not.
 * @param  {string}   meetingID the meeting ID of the meeting we are creating and/or connecting to
 * @param  {string}   sessionID the session ID of the user that is connecting to the meeting
 * @param  {string}   username  username of the users that that is connecting to the meeting
 * @param  {Function} callback  the callback function returns true if meeting successfully started and joined, false otherwise
 * @return {undefined}          callback is used to send the status back to the caller of this function
 */
function makeMeeting(meetingID, sessionID, username, callback) {
  if((username) && (meetingID) && (username.length <= max_username_length) && (meetingID.split(' ').length == 1)) {
    var publicID = (new Date()).getTime();
    redisAction.isMeetingRunning(meetingID, function(isRunning) {
      if(!isRunning) {
        redisAction.createMeeting(meetingID, function() {
          redisAction.setCurrentTool(meetingID, 'line');
          redisAction.setPresenter(meetingID, sessionID, publicID);
        });
      }
    });
    redisAction.createUser(meetingID, sessionID);
    store.get(redisAction.getCurrentPresentationString(meetingID), function (err, currPresID) {
      if(!currPresID) {
        redisAction.createPresentation(meetingID, true, function (presentationID) {
          redisAction.createPage(meetingID, presentationID, 'default.png', true, function (pageID) {
            redisAction.setViewBox(meetingID, JSON.stringify([0, 0, 1, 1]));
            var folder = routes.presentationImageFolder(meetingID,presentationID);
            fs.mkdir(folder, 0777 , function (reply) {
              newFile = fs.createWriteStream(folder + '/default.png');
              oldFile = fs.createReadStream('images/default.png');
              newFile.once('open', function (fd) {
                  util.pump(oldFile, newFile);
                  redisAction.setImageSize(meetingID, presentationID, pageID, 800, 600);
              });
            });
          });
        });
      }
    });
    redisAction.setIDs(meetingID, sessionID, publicID, function() {
      redisAction.updateUserProperties(meetingID, sessionID, ["username", username,
              "meetingID", meetingID, "refreshing", false, "dupSess", false, "sockets", 0, 'pubID', publicID]);
      callback(true);
    });
  }
  else callback(false);
}

/**
 * Upon submitting their login details from the index page via a POST request,
 * a meeting will be created and joined. If an error occurs, which usually
 * results in using a username/meetingID that is too long, the user receives
 * an error response. Both success and error responses are in json only.
 * @param  {Object} req Request object from the client
 * @param  {Object} res Response object to the client
 * @return {undefined}  Response object is sent back to the client.
 */
exports.post_auth = function(req, res) {
  var user = req.body;
  var username = sanitizer.escape(user.username);
  var meetingID = sanitizer.escape(user.meetingID);
  var sessionID = req.sessionID;
  makeMeeting(meetingID, sessionID, username, function(join) {
    user.meetingID = meetingID;
    user.username = username;
    res.contentType("json");
    if(join) {
      res.cookie('sessionid', sessionID); //save the id so socketio can get the username
      res.cookie('meetingid', meetingID);
      user.loginAccepted = true;
      res.send(user);
    } else {
      user.loginAccepted = false;
      res.send(user);
    }
  });
};

/**
 * Returns a json informing if there's an authenticated user or not.
 * The  meetingID and sessionID are extracted from the user's cookie.
 * If they match with a user that is in the database, the user is
 * accepted and his information is included in the response. If they don't
 * match, the user is not accepted.
 * @param  {Object} req Request object from the client
 * @param  {Object} res Response object to the client
 * @return {undefined}  Response object is sent back to the client.
 */
exports.get_auth = function(req, res) {
  redisAction.isValidSession(req.cookies.meetingid, req.cookies.sessionid, function (valid) {
    res.contentType("json");
    if(!valid) {
      var user = {};
      user.loginAccepted = false;
      res.send(user);
    }
    else {
      var user = {};
      user.loginAccepted = true;
      user.meetingID = req.cookies.meetingid;
      // user.username = ?? // TODO
      res.send(user);
    }
  });
};


/**
 * When a user logs out, their session is destroyed,
 * and their cookies are cleared.
 * @param  {Object} req Request object from the client
 * @param  {Object} res Response object to the client
 * @return {undefined}  Response object is sent back to the client.
 */
exports.logout = function(req, res) {
  req.session.destroy(); //end the session
  res.cookie('sessionid', null); //clear the cookie from the client
  res.cookie('meetingid', null);
  res.redirect('/');
};

/**
 * The join URL is used to connect to a meeting immediately without
 * going to the login screen.
 * Example:
 *   localhost:3000/join?meetingid=123&fullname=Ryan&checksum=password
 * This will connect under the meetingID 123 with the name "Ryan" as
 * long as the checksum string is equal on the server side.
 * @param  {Object} req Request object from the client
 * @param  {Object} res Response object to the client
 * @return {undefined}  Response object is sent back to the client.
 */
exports.join = function(req, res) {
  var query = req.query;
  if(query) {
    var meetingID = query.meetingid;
    var username = query.fullname;
    var checksum = query.checksum;
    var sessionID = req.sessionID;
    // checksum is checked here against a simple keyword for now
    if(checksum == "password") {
      //create meeting
      makeMeeting(meetingID, sessionID, username, function(join) {
        //if the meeting was created successfully
        if(join) {
          //store the cookies
          res.cookie('sessionid', sessionID); //save the id so socketio can get the username
          res.cookie('meetingid', meetingID);
        }
        res.redirect('/');
      });
    }
    else res.redirect('/');
  }
};

/**
 * POSTing a file from the client page, the images will be
 * converted and their URLs will be send via SocketIO if
 * successful. If unsuccessful, a status of failed will be sent.
 * @param  {Object}   req  Request object from the client
 * @param  {Object}   res  Response object to the client
 * @return {undefined}     Response object is sent back to the client.
 */
exports.post_upload = function(req, res) {
  // the client must send a file
  if(req.files.image.size !== 0) {
    var meetingID = req.cookies.meetingid;
    var sessionID = req.cookies.sessionid;
    pub.publish(meetingID, JSON.stringify(['uploadStatus', "Processing..."]));
    redisAction.isValidSession(meetingID, sessionID, function (reply) {
      var file = req.files.image.path;
      var pageIDs = [];
      redisAction.getCurrentPresentationID(meetingID, function(prevPresID) {
        redisAction.getCurrentPageID(meetingID, prevPresID, function(prevPageID) {
          redisAction.createPresentation(meetingID, false, function (presentationID) {
            redisAction.setViewBox(meetingID, JSON.stringify([0, 0, 1, 1]));
            var folder = routes.presentationImageFolder(meetingID,presentationID);
            //make the directory the presentation files will go into.
            fs.mkdir(folder, 0777 , function (reply) {
              // ImageMagick call to convert file to PNG images named slide0.png, slide1.png, slide2.png, etc...
              im.convert(['-quality', '50', '-density', '150x150', file, folder + '/slide%d.png'], function (err) {
                if(!err) {
                  //counts how many files are in the folder for the presentation to get the slide count.
                  exec("ls -1 " + folder + "/ | wc -l", function (error, stdout, stdouterr) {
                    var numOfPages = parseInt(stdout, 10);
                    var numComplete = 0;
                    // interate through each of the files and create a page for each of them.
                    for(var i = 0; i < numOfPages; i++) {
                      var setCurrent = true;
                      if(i !== 0) setCurrent = false;
                      redisAction.createPage(meetingID, presentationID, "slide" + i + ".png", setCurrent, function (pageID, imageName) {
                        //ImageMagick call to get the image size from each of the converted images.
                        im.identify(folder + "/" + imageName, function(err, features) {
                          if (err) throw err;
                          else redisAction.setImageSize(meetingID, presentationID, pageID, features.width, features.height, function() {
                            pageIDs.push(pageID);
                            numComplete++;
                            if(numComplete == numOfPages) {
                              // Once complete, set the current presentation to the new one
                              // and publish the new slides to all members of the meeting.
                              redisAction.setCurrentPresentation(meetingID, presentationID, function() {
                                pub.publish(meetingID, JSON.stringify(['clrPaper']));
                                socketAction.publishSlides(meetingID, null, function() {
                                  socketAction.publishViewBox(meetingID);
                                  pub.publish(meetingID, JSON.stringify(['uploadStatus', "Upload succeeded", true]));
                                });
                              });
                            }
                          });
                        });
                      });
                    }
                  });
                }
                else {
                  console.log(err);
                  fs.rmdir(folder, function() {
                    console.log("Deleted invalid presentation folder");
                    pub.publish(meetingID, JSON.stringify(['uploadStatus', "Invalid file", true]));
                  });
                }
              });
            });
          });
        });
      });
    });
  }
  // TODO: return a json indicating success/failure
  res.redirect('/');
};

/**
 * Any other page that we have not defined yet.
 * @param  {Object} req Request object from the client
 * @param  {Object} res Response object to the client
 * @return {undefined}  Response object is sent back to the client.
 */
exports.error404 = function(req, res) {
  console.log("User tried to access: " + req.url);
  res.send("Page not found", 404);
};

/**
 * @param  {Object} req Request object from the client
 * @param  {Object} res Response object to the client
 * @return {undefined}  Response object is sent back to the client.
 */
exports.meetings = function(req, res) {
  redisAction.getMeetings(function (results){
    res.contentType("json");
    res.send(JSON.stringify(results));
  });
};
