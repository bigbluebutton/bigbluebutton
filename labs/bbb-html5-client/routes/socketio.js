/**
 * Publish usernames to all the sockets
 * @param  {string}   meetingID ID of the meeting
 * @param  {string}   sessionID ID of the user
 * @param  {Function} callback  callback to call when finished
 * @return {undefined} publish to Redis PubSub
 */
exports.publishUsernames = function(meetingID, sessionID, callback) {
  var usernames = [];
  redisAction.getUsers(meetingID, function (users) {
      for (var i = users.length - 1; i >= 0; i--){
        usernames.push({ 'name' : users[i].username, 'id' : users[i].pubID });
      };
      var receivers = sessionID != undefined ? sessionID : meetingID;
      pub.publish(receivers, JSON.stringify(['user list change', usernames]));
      if(callback) callback(true);
  });
  store.scard(redisAction.getUsersString(meetingID), function(err, cardinality) {
    if(cardinality == '0') {
      redisAction.processMeeting(meetingID);
      if(callback) callback(false);
    }
  });
};

/**
 * Publish presenter to appropriate clients.
 * @param  {string}    meetingID ID of the meeting
 * @param  {string}    sessionID ID of the user
 * @param  {Function}  callback  callback to call when finished
 * @return {undefined} publish to Redis PubSub
 */
exports.publishPresenter = function(meetingID, sessionID, callback) {
  redisAction.getPresenterPublicID(meetingID, function(publicID) {
    var receivers = sessionID != undefined ? sessionID : meetingID;
    pub.publish(receivers, JSON.stringify(['setPresenter', publicID]));
    if(callback) callback(true);
  });
};

/**
 * Get all messages from Redis and publish to a specific sessionID (user)
 * @param  {string}    meetingID ID of the meeting
 * @param  {string}    sessionID ID of the user
 * @param  {Function}  callback  callback to call when finished
 * @return {undefined} publish to Redis PubSub
 */
exports.publishMessages = function(meetingID, sessionID, callback) {
  var messages = [];
  redisAction.getCurrentPresentationID(meetingID, function(presentationID) {
    redisAction.getCurrentPageID(meetingID, presentationID, function(pageID) {
      redisAction.getItems(meetingID, presentationID, pageID, 'messages', function (messages) {
        var receivers = sessionID != undefined ? sessionID : meetingID;
        pub.publish(receivers, JSON.stringify(['all_messages', messages]));
        if(callback) callback();
      });
    });
  });
};

/**
 * Publish list of slides from Redis to the appropriate clients
 * @param  {string}    meetingID ID of the meeting
 * @param  {string}    sessionID ID of the user
 * @param  {Function}  callback  callback to call when finished
 * @return {undefined} publish to Redis PubSub
 */
exports.publishSlides = function(meetingID, sessionID, callback) {
  var slides = [];
  redisAction.getCurrentPresentationID(meetingID, function(presentationID) {
    redisAction.getPageIDs(meetingID, presentationID, function(presentationID, pageIDs) {
     var numOfSlides = pageIDs.length;
     var slideCount = 0;
     for(var i = 0; i < numOfSlides; i++) {
       redisAction.getPageImage(meetingID, presentationID, pageIDs[i], function(pageID, filename) {
         redisAction.getImageSize(meetingID, presentationID, pageID, function(width, height) {
           slides.push(['images/presentation' +presentationID+'/'+filename, width, height]);
            if(slides.length == numOfSlides) {
               var receivers = sessionID != undefined ? sessionID : meetingID;
               pub.publish(receivers, JSON.stringify(['all_slides', slides]));
               if(callback) callback();
            }
         });
       });
     }
    });
  });
};
/**
 * Publish list of shapes from Redis to appropriate clients
 * @param  {string}    meetingID ID of the meeting
 * @param  {string}    sessionID ID of the user
 * @param  {Function}  callback  callback to call when finished
 * @return {undefined} publish to Redis PubSub
 */
exports.publishShapes = function(meetingID, sessionID, callback) {
  var shapes = [];
  redisAction.getCurrentPresentationID(meetingID, function(presentationID) {
    redisAction.getCurrentPageID(meetingID, presentationID, function(pageID) {
      redisAction.getItems(meetingID, presentationID, pageID, 'currentshapes', function (shapes) {
        var receivers = sessionID != undefined ? sessionID : meetingID;
        pub.publish(receivers, JSON.stringify(['all_shapes', shapes]));
        if(callback) callback();
      });
    });
  });
};

/**
 * Publish viewbox from Redis to appropriate clients
 * @param  {string}    meetingID ID of the meeting
 * @param  {string}    sessionID ID of the user
 * @param  {Function}  callback  callback to call when finished
 * @return {undefined} publish to Redis PubSub
 */
exports.publishViewBox = function(meetingID, sessionID, callback) {
  redisAction.getCurrentPresentationID(meetingID, function(presentationID) {
    redisAction.getViewBox(meetingID, function(viewBox) {
      viewBox = JSON.parse(viewBox);
      var receivers = sessionID != undefined ? sessionID : meetingID;
      pub.publish(receivers, JSON.stringify(['paper', viewBox[0], viewBox[1], viewBox[2], viewBox[3]]));
      if(callback) callback();
    });
  });
};

/**
 * Publish tool from Redis to appropriate clients
 * @param  {string}    meetingID ID of the meeting
 * @param  {string}    sessionID ID of the user
 * @param  {string}    tool      [description]
 * @param  {Function}  callback  callback to call when finished
 * @return {undefined} publish to Redis PubSub
 */
exports.publishTool = function(meetingID, sessionID, tool, callback) {
  redisAction.getCurrentTool(meetingID, function(tool) {
    var receivers = sessionID != undefined ? sessionID : meetingID;
    pub.publish(receivers, JSON.stringify(['toolChanged', tool]));
    if(callback) callback();
  });
};

/**
 * All socket IO events that can be emitted by the client
 * @param {[type]} socket [description]
 */
exports.SocketOnConnection = function(socket) {
 
  //When a user sends a message...
  socket.on('msg', function (msg) {
    msg = sanitizer.escape(msg);
    var handshake = socket.handshake;
    var sessionID = handshake.sessionID;
    var meetingID = handshake.meetingID;
    redisAction.isValidSession(meetingID, sessionID, function (reply) {
      if(reply) {
        if(msg.length > max_chat_length) {
          pub.publish(sessionID, JSON.stringify(['msg', 'System', 'Message too long.']));
        }
        else {
          var username = handshake.username;
          pub.publish(meetingID, JSON.stringify(['msg', username, msg]));
          var messageID = rack(); //get a randomly generated id for the message
         
          //try later taking these nulls out and see if the function still works
          store.rpush(redisAction.getMessagesString(meetingID, null, null), messageID); //store the messageID in the list of messages
          store.hmset(redisAction.getMessageString(meetingID, null, null, messageID), 'message', msg, 'username', username);
        }
      }
    });
  });

  /**
   * When a user connects to the socket...
   * @return {undefined} publish to Redis PubSub
   */
  socket.on('user connect', function () {
    var handshake = socket.handshake;
    var sessionID = handshake.sessionID;
    var meetingID = handshake.meetingID;
    redisAction.isValidSession(meetingID, sessionID, function (reply) {
     if(reply) {
        var username = handshake.username;
        var socketID = socket.id;
     
        socket.join(meetingID); //join the socket Room with value of the meetingID
        socket.join(sessionID); //join the socket Room with value of the sessionID
       
        //add socket to list of sockets.
        redisAction.getUserProperties(meetingID, sessionID, function(properties) {
          var numOfSockets = parseInt(properties.sockets, 10);
          numOfSockets+=1;
          store.hset(redisAction.getUserString(meetingID, sessionID), 'sockets', numOfSockets);
          if ((properties.refreshing == 'false') && (properties.dupSess == 'false')) {
            //all of the next sessions created with this sessionID are duplicates
            store.hset(redisAction.getUserString(meetingID, sessionID), 'dupSess', true);
            socketAction.publishUsernames(meetingID, null, function() {
              socketAction.publishPresenter(meetingID);
            });
         }
         else {
           store.hset(redisAction.getUserString(meetingID, sessionID), 'refreshing', false);
           socketAction.publishUsernames(meetingID, sessionID, function() {
             socketAction.publishPresenter(meetingID, sessionID);
           });
         }
         socketAction.publishMessages(meetingID, sessionID);
         socketAction.publishSlides(meetingID, sessionID, function() {
           socketAction.publishTool(meetingID, sessionID);
           socketAction.publishShapes(meetingID, sessionID);
           socketAction.publishViewBox(meetingID, sessionID);
         });
       });
     }
    });
  });

  /**
   * When a user disconnects from the socket...
   * @return {undefined} publish to Redis PubSub
   */
  socket.on('disconnect', function () {
    var handshake = socket.handshake;
   var sessionID = handshake.sessionID;
   var meetingID = handshake.meetingID;
   //check if user is still in database
   redisAction.isValidSession(meetingID, sessionID, function (isValid) {
     if(isValid) {
       var username = handshake.username;
       var socketID = socket.id;
       redisAction.updateUserProperties(meetingID, sessionID, ['refreshing', true], function(success) {
         setTimeout(function () {
             //in one second, check again...
           redisAction.isValidSession(meetingID, sessionID, function (isValid) {
            if(isValid) {
              redisAction.getUserProperties(meetingID, sessionID, function(properties) {
                  var numOfSockets = parseInt(properties.sockets, 10);
                  numOfSockets-=1;
                if(numOfSockets == 0) {
                  redisAction.deleteUser(meetingID, sessionID, function() {
                    socketAction.publishUsernames(meetingID);
                  });
                }
                else {
                  redisAction.updateUserProperties(meetingID, sessionID, ['sockets', numOfSockets]);
                }
              });
            }
             else {
              socketAction.publishUsernames(meetingID);
              socketAction.publishPresenter(meetingID, sessionID);
             }
           });
         }, 1000);
       });
     }
   });
  });
 
  /**
   * When the user logs out
   * @return {undefined} publish to Redis PubSub
   */
  socket.on('logout', function() {
    var handshake = socket.handshake;
   var sessionID = handshake.sessionID;
   var meetingID = handshake.meetingID;
   redisAction.isValidSession(meetingID, sessionID, function (isValid) {
     if(isValid) {
       //initialize local variables
       var username = handshake.username;
       //remove the user from the list of users
       store.srem(redisAction.getUsersString(meetingID), sessionID, function(numDeleted) {
         //delete key from database
         store.del(redisAction.getUserString(meetingID, sessionID), function(reply) {
            pub.publish(sessionID, JSON.stringify(['logout'])); //send to all users on same session (all tabs)
            socket.disconnect(); //disconnect own socket
         });
       });
     }
     socketAction.publishUsernames(meetingID);
    });
  });
 
  /**
   * A user clicks to change to previous slide
   * @return {undefined} publish to Redis PubSub
   */
  socket.on('prevslide', function () {
    var handshake = socket.handshake;
   var sessionID = handshake.sessionID;
   var meetingID = handshake.meetingID;
    redisAction.getPresenterSessionID(meetingID, function(presenterID) {
      if(presenterID == sessionID) {
        redisAction.getCurrentPresentationID(meetingID, function(presentationID) {
          redisAction.changeToPrevPage(meetingID, presentationID, function(pageID){
            redisAction.getPageImage(meetingID, presentationID, pageID, function(pageID, filename)  {
              pub.publish(meetingID, JSON.stringify(['changeslide', 'images/presentation' + presentationID + '/'+filename]));
              pub.publish(meetingID, JSON.stringify(['clrPaper']));
             socketAction.publishShapes(meetingID);
            });
          });
        });
      }
    });
  });
 
  /**
   * A user clicks to change to next slide
   * @return {undefined} publish to Redis PubSub
   */
  socket.on('nextslide', function () {
    var handshake = socket.handshake;
   var sessionID = handshake.sessionID;
   var meetingID = handshake.meetingID;
    redisAction.getPresenterSessionID(meetingID, function(presenterID) {
      if(presenterID == sessionID) {
        redisAction.getCurrentPresentationID(meetingID, function(presentationID) {
          redisAction.changeToNextPage(meetingID, presentationID, function(pageID){
            redisAction.getPageImage(meetingID, presentationID, pageID, function(pageID, filename) {
              pub.publish(meetingID, JSON.stringify(['changeslide', 'images/presentation' + presentationID + '/'+filename]));
              pub.publish(meetingID, JSON.stringify(['clrPaper']));
             socketAction.publishShapes(meetingID);
            });
          });
        });
      }
    });
  });
 
  /**
   * When a rectangle creation event is received
   * @param  {string} shape type of shape
   * @param  {Object} data  information needed to draw the shape
   * @return {undefined} publish to Redis PubSub
   */
  socket.on('makeShape', function (shape, data) {
    var meetingID = socket.handshake.meetingID;
    redisAction.getPresenterSessionID(meetingID, function(presenterID) {
      if(presenterID == socket.handshake.sessionID) {
        pub.publish(meetingID, JSON.stringify(['makeShape', shape, data]));
      }
    });
  });
 
  /**
   * When a update shape event is received
   * @param  {string} shape type of shape
   * @param  {Object} data  information needed to draw the shape
   * @return {undefined} publish to Redis PubSub
   */
  socket.on('updShape', function (shape, data) {
    var meetingID = socket.handshake.meetingID;
    redisAction.getPresenterSessionID(meetingID, function(presenterID) {
      if(presenterID == socket.handshake.sessionID) {
        pub.publish(meetingID, JSON.stringify(['updShape', shape, data]));
      }
    });
  });

  /**
   * When a cursor move event is received
   * @param  {[type]} x x coord of cursor as a percentage of width
   * @param  {[type]} y y coord of cursor as a percentage of height
   * @return {undefined} publish to Redis PubSub
   */
  socket.on('mvCur', function (x, y) {
    var meetingID = socket.handshake.meetingID;
    redisAction.getPresenterSessionID(meetingID, function(presenterID) {
      if(presenterID == socket.handshake.sessionID) {
        pub.publish(meetingID, JSON.stringify(['mvCur', x, y]));
      }
    });
  });
 
  /**
   * When a clear Paper event is received
   * @return {undefined} publish to Redis PubSub
   */
  socket.on('clrPaper', function () {
    var meetingID = socket.handshake.meetingID;
    var sessionID = socket.handshake.sessionID;
    redisAction.getPresenterSessionID(meetingID, function(presenterID) {
      if(presenterID == socket.handshake.sessionID) {
        redisAction.getCurrentPresentationID(meetingID, function(presentationID) {
          redisAction.getCurrentPageID(meetingID, presentationID, function(pageID) {
            redisAction.getItemIDs(meetingID, presentationID, pageID, 'currentshapes', function(meetingID, presentationID, pageID, itemIDs, itemName) {
              redisAction.deleteItemList(meetingID, presentationID, pageID, itemName, itemIDs);
            });
            pub.publish(meetingID, JSON.stringify(['clrPaper']));
            socketAction.publishTool(meetingID, sessionID);
          });
        });
      }
    });
  });

  /**
   * When the user wishes to set the presenter to another user
   * @param  {[type]} publicID public ID of user to make presenter
   * @return {undefined} publish to Redis PubSub
   */
  socket.on('setPresenter', function (publicID) {
    console.log('setting presenter to' + publicID);
    var meetingID = socket.handshake.meetingID;
    redisAction.setPresenterFromPublicID(meetingID, publicID, function(success) {
      if(success) {
        pub.publish(meetingID, JSON.stringify(['setPresenter', publicID]));
      }
    });
  });

  /**
   * When a user is updating the viewBox of the paper
   * @param  {number} cx x-offset from corner as a percentage of width
   * @param  {number} cy y-offset from corner as a percentage of height
   * @param  {number} sw width of page as a percentage of original width
   * @param  {number} sh height of page as a percentage of original height
   * @return {undefined} publish to Redis PubSub
   */
  socket.on('paper', function (cx, cy, sw, sh) {
    var meetingID = socket.handshake.meetingID;
    redisAction.getPresenterSessionID(meetingID, function(presenterID) {
      if(presenterID == socket.handshake.sessionID) {
        pub.publish(socket.handshake.meetingID, JSON.stringify(['paper', cx, cy, sw, sh]));
        if(!sw && !sh) {
          redisAction.getViewBox(socket.handshake.meetingID, function(viewbox) {
            var viewbox = JSON.parse(viewbox);
            redisAction.setViewBox(socket.handshake.meetingID, JSON.stringify([cx, cy, viewbox[2], viewbox[3]]));
          });
        }
        else redisAction.setViewBox(socket.handshake.meetingID, JSON.stringify([cx, cy, sw, sh]));
      }
    });
  });
 
  /**
   * When a user is zooming
   * @param  {number} delta amount the mouse scroll has moved
   * @return {undefined} publish to Redis PubSub
   */
  socket.on('zoom', function(delta) {
    var meetingID = socket.handshake.meetingID;
    redisAction.getPresenterSessionID(meetingID, function(presenterID) {
      if(presenterID == socket.handshake.sessionID) {
        pub.publish(meetingID, JSON.stringify(['zoom', delta]));
      }
    });
  });
 
  /**
   * When a user finishes panning
   * @return {undefined} publish to Redis PubSub
   */
  socket.on('panStop', function() {
    var meetingID = socket.handshake.meetingID;
    redisAction.getPresenterSessionID(meetingID, function(presenterID) {
      if(presenterID == socket.handshake.sessionID) {
        pub.publish(meetingID, JSON.stringify(['panStop']));
      }
    });
  });
  
  /**
   * Undoing the last shape
   * @return {undefined} publish to Redis PubSub
   */
  socket.on('undo', function() {
    var meetingID = socket.handshake.meetingID;
    redisAction.getPresenterSessionID(meetingID, function(presenterID) {
      if(presenterID == socket.handshake.sessionID) {
        redisAction.getCurrentPresentationID(meetingID, function(presentationID) {
          redisAction.getCurrentPageID(meetingID, presentationID, function(pageID) {
            //pop the last shape off the current list of shapes
            store.rpop(redisAction.getCurrentShapesString(meetingID, presentationID, pageID), function(err, reply) {
              socketAction.publishShapes(meetingID);
            });
          });
        });
      }
    });
  });
  
  /**
   * Telling everyone the current text has been finished
   * @return {undefined} publish to Redis PubSub
   */
  socket.on('textDone', function() {
    var meetingID = socket.handshake.meetingID;
    redisAction.getPresenterSessionID(meetingID, function(presenterID) {
      if(presenterID == socket.handshake.sessionID) {
        pub.publish(meetingID, JSON.stringify(['textDone']));
      }
    });
  });
 
  /**
   * Saving a shape to Redis. Does not provide feedback to client(s)
   * @param  {string} shape type of shape
   * @param  {Object} data  information needed to recreate shape
   * @return {undefined}    publish to Redis PubSub
   */
  socket.on('saveShape', function (shape, data) {
    var handshake = socket.handshake;
    var meetingID = handshake.meetingID;
    redisAction.getPresenterSessionID(meetingID, function(presenterID) {
      if(presenterID == handshake.sessionID) {
        redisAction.getCurrentPresentationID(meetingID, function(presentationID) {
          redisAction.getCurrentPageID(meetingID, presentationID, function(pageID) {
            var shapeID = rack(); //get a randomly generated id for the shape
            store.rpush(redisAction.getCurrentShapesString(meetingID, presentationID, pageID), shapeID);
            store.hmset(redisAction.getShapeString(meetingID, presentationID, pageID, shapeID),
                'shape', shape, 'data', data, function(err, reply) {
            });
          });
        });
      }
    });
  });

  /**
   * Changing the currently set tool.
   * Set the current tool in Redis, then publish
   * the tool change to the members
   * @param  {string} tool  name of the tool to change to
   * @return {undefined}    publish to Redis PubSub
   */
  socket.on('changeTool', function (tool) {
     var handshake = socket.handshake;
     var meetingID = handshake.meetingID;
     redisAction.getPresenterSessionID(meetingID, function(presenterID) {
       if(presenterID == socket.handshake.sessionID) {
          redisAction.setCurrentTool(meetingID, tool, function(success) {
            if(success) {
              pub.publish(meetingID, JSON.stringify(['toolChanged', tool]));
            }
          });
       }
     });
  });
 
  /**
   * If a user requests all the shapes,
   * publish the shapes to everyone.
   * Only reason this happens is when its fit changes.
   * @return {undefined} publish to Redis PubSub
   */
  socket.on('all_shapes', function(){
    var handshake = socket.handshake;
    var meetingID = handshake.meetingID;
    var sessionID = handshake.sessionID;
    socketAction.publishShapes(meetingID);
  });
  
  /**
   * Updating the fit of the image to the whiteboard
   * @param  {boolean} fit true for fit to page and false for fit to width
   * @return {undefined}   publish to Redis PubSub
   */
  socket.on('fitToPage', function(fit) {
    var handshake = socket.handshake;
    var meetingID = handshake.meetingID;
    redisAction.getPresenterSessionID(meetingID, function(presenterID) {
       if(presenterID == sockt.handshake.sessionID) {
         pub.publish(meetingID, JSON.stringify(['fitToPage', fit]));
       }
     });
  });
};
