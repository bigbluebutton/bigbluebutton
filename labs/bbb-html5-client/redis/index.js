/**
 * Returns the function for getting the string of a specific
 * item given the name of the item type in Redis.
 * @param  {string} itemString the name of the item
 * @return {Function}          the function used to get the key for a specific item from Redis
 */
exports.getItemStringFunction = function(itemString) {
  var functions = {
    "messages" : redisAction.getMessageString,
    "shapes" : redisAction.getShapeString,
    "currentshapes" : redisAction.getShapeString
  };
  return functions[itemString];
};

/**
 * Returns the function for getting the string of all the items
 * given the name of the items in Redis
 * @param  {string} itemString the name of the item
 * @return {Function}          the function used to get the key for the list of specific items in Redis
 */
exports.getItemsStringFunction = function(itemString) {
  var functions = {
    "messages" : redisAction.getMessagesString,
    "shapes" : redisAction.getCurrentShapesString,
    "currentshapes" : redisAction.getCurrentShapesString
  };
  return functions[itemString];
};

/**
 * Get the key for the list of meetings in Redis
 * @return {string} the key for the list of meetings in Redis
 */
exports.getMeetingsString = function() {
  return "meetings";
};

/**
 * Get the string representing the key for the meeting
 * given the meetingID in Redis
 * @param  {string} meetingID the ID of the meeting
 * @return {string}           the key for the meeting given the meetingID in Redis
 */
exports.getMeetingString = function(meetingID) {
  return "meeting-" + meetingID;
};

/**
 * Get the string representing the key for the hash of all
 * the users for a specified meetingID in Redis
 * @param  {string} meetingID the ID of the meeting
 * @return {string}           the key for the hash of all the users for a specified meetingID in Redis
 */
exports.getUsersString = function(meetingID) {
  return "meeting-" + meetingID + "-users";
};

/**
 * Get the string representing the key for a specific sessionID in Redis
 * @param  {string} meetingID the ID of the meeting
 * @param  {string} sessionID the sessionID (unique ID) of the user
 * @return {string}           the key for a specific sessionID in Redis
 */
exports.getUserString = function(meetingID, sessionID) {
  return "meeting-" + meetingID + "-user-" + sessionID;
};

/**
 * Get the string representing the key for the list of current users
 * in a specific meeting ID
 * @param  {string} meetingID the ID of the meeting
 * @return {string}           key for the list of current users in a specific meeting ID
 */
exports.getCurrentUsersString = function(meetingID) {
  return "meeting-" + meetingID + "-currentusers";
};

/**
 * Get the string representing the key for the hash of all
 * the messages for a specified meetingID in Redis
 * @param  {string} meetingID      the ID of the meeting
 * @param  {string} presentationID the unique ID of the presentation in the meeting
 * @param  {string} pageID         the unique ID of the page in the presentation
 * @return {string}                the key for the hash of all the messages for a specified meetingID in Redis
 */
exports.getMessagesString = function(meetingID, presentationID, pageID) {
  return "meeting-" + meetingID + "-messages";
};

/**
 * Get the string representing the key for a specific message in Redis
 * @param  {string} meetingID      the ID of the meeting
 * @param  {string} presentationID the unique ID of the presentation in the meeting
 * @param  {string} pageID         the unique ID of the page in the presentation
 * @param  {string} messageID      the unique ID of the message in the public chat
 * @return {string}                string representing the key for a specific message in Redis
 */
exports.getMessageString = function(meetingID, presentationID, pageID, messageID) {
  return "meeting-" + meetingID + "-message-" + messageID;
};

/**
 * Get the key for the list of presentations for a meeting ID
 * @param  {string} meetingID the ID of the meeting
 * @return {string}           key for the list of presentations for a meeting ID
 */
exports.getPresentationsString = function(meetingID) {
  return "meeting-" + meetingID + "-presentations";
};

/**
 * Get the key for a specific presentation in a meeting
 * @param  {string} meetingID      the ID of the meeting
 * @param  {string} presentationID the unique ID of the presentation in the meeting
 * @return {string}                key for a specific presentation in a meeting
 */
exports.getPresentationString = function(meetingID, presentationID) {
  return "meeting-" + meetingID + "-presentation-" + presentationID;
};

/**
 * Get the key for the pages in a specific presentation in a meeting
 * @param  {string} meetingID      the ID of the meeting
 * @param  {string} presentationID the unique ID of the presentation in the meeting
 * @return {string}                key for the pages in a specific presentation in a meeting
 */
exports.getPagesString = function(meetingID, presentationID) {
  return "meeting-" + meetingID + "-presentation-" + presentationID + "-pages";
};

/**
 * Get the key for the current presentation of the meeting
 * @param  {string} meetingID the ID of the meeting
 * @return {string}           key for the current presentation of the meeting
 */
exports.getCurrentPresentationString = function(meetingID) {
  return "meeting-" + meetingID + "-currentpresentation";
};

/**
 * Get the key for the current page in the presentation
 * @param  {string} meetingID      the ID of the meeting
 * @param  {string} presentationID the unique ID of the presentation in the meeting
 * @return {string}                key for the current page in the presentation
 */
exports.getCurrentPageString = function(meetingID, presentationID) {
  return "meeting-" + meetingID + "-presentation-" + presentationID + "-currentpage";
};

/**
 * Get key of specific page.
 * @param  {string} meetingID      the ID of the meeting
 * @param  {string} presentationID the unique ID of the presentation in the meeting
 * @param  {string} pageID         the unique ID of the page in the presentation
 * @return {string}                key of specific page.
 */
exports.getPageString = function(meetingID, presentationID, pageID) {
  return "meeting-" + meetingID + "-presentation-" + presentationID + "-page-" + pageID;
};

/**
 * Get key of page image.
 * @param  {string} meetingID      the ID of the meeting
 * @param  {string} presentationID the unique ID of the presentation in the meeting
 * @param  {string} pageID         the unique ID of the page in the presentation
 * @return {string}                key of page image.
 */
exports.getPageImageString = function(meetingID, presentationID, pageID) {
  return "meeting-" + meetingID + "-presentation-" + presentationID + "-page-" + pageID + "-image";
};

/**
 * Get key for list of current shapes for the page
 * @param  {string} meetingID      the ID of the meeting
 * @param  {string} presentationID the unique ID of the presentation in the meeting
 * @param  {string} pageID         the unique ID of the page in the presentation
 * @return {string}                key for list of current shapes for the page
 */
exports.getCurrentShapesString = function(meetingID, presentationID, pageID) {
  return "meeting-" + meetingID + "-presentation-" + presentationID + "-page-" + pageID + "-currentshapes";
};

/**
 * Get key for specific shape on page
 * @param  {string} meetingID      the ID of the meeting
 * @param  {string} presentationID the unique ID of the presentation in the meeting
 * @param  {string} pageID         the unique ID of the page in the presentation
 * @param  {string} shapeID        the unique ID of the shape in the page
 * @return {string}                key for specific shape on page
 */
exports.getShapeString = function(meetingID, presentationID, pageID, shapeID) {
  return "meeting-" + meetingID + "-presentation-" + presentationID + "-page-" + pageID + "-shape-" + shapeID;
};

/**
 * Get the key for the current viewbox
 * @param  {string} meetingID the ID of the meeting
 * @return {string}           the key for the current viewbox
 */
exports.getCurrentViewBoxString = function(meetingID) {
  return "meeting-" + meetingID + "-viewbox";
};

/**
 * Get the key for the current tool
 * @param  {string} meetingID the ID of the meeting
 * @return {string}           the key for the current tool
 */
exports.getCurrentToolString = function(meetingID) {
  return "meeting-" + meetingID + "-currenttool";
};

/**
 * Get the key for the presenter
 * @param  {string} meetingID the ID of the meeting
 * @return {string}           the key for the presenter
 */
exports.getPresenterString = function(meetingID) {
  return "meeting-" + meetingID + "-presenter";
};

/**
 * Get the key for the public ID for a user
 * @param  {string} meetingID the ID of the meeting
 * @param  {string} publicID  the unique public ID of the user
 * @return {string}           the key for the public ID for a user
 */
exports.getPublicIDString = function (meetingID, publicID) {
  return 'meeting-' + meetingID + '-publicID-' + publicID;
};
/**
 * Get the key for session ID for a user
 * @param  {string} meetingID the ID of the meeting
 * @param  {string} sessionID the sessionID (unique ID) of the user
 * @return {string}           the key for session ID for a user
 */
exports.getSessionIDString = function (meetingID, sessionID) {
  return 'meeting-' + meetingID + '-sessionID-' + sessionID;
};

/**
 * Get the key for the width of a page image
 * @param  {string} meetingID      the ID of the meeting
 * @param  {string} presentationID the unique ID of the presentation in the meeting
 * @param  {string} pageID         the unique ID of the page in the presentation
 * @return {string}                the key for the width of a page image
 */
exports.getPageWidthString = function(meetingID, presentationID, pageID) {
  return 'meeting-' + meetingID + '-presentation-' + presentationID + '-page-' + pageID + '-width';
};

/**
 * Get the key for the height of a page image
 * @param  {string} meetingID      the ID of the meeting
 * @param  {string} presentationID the unique ID of the presentation in the meeting
 * @param  {string} pageID         the unique ID of the page in the presentation
 * @return {string}                the key for the height of a page image
 */
exports.getPageHeightString = function(meetingID, presentationID, pageID) {
  return 'meeting-' + meetingID + '-presentation-' + presentationID + '-page-' + pageID + '-height';
};

/**
 * Set the public and session ID to match one another
 * for lookup later
 * @param {string}   meetingID the ID of the meeting
 * @param {string}   sessionID the sessionID (unique ID) of the user
 * @param {string}   publicID  the unique public ID of the user
 * @param {Function} callback  callback function
 */
exports.setIDs = function(meetingID, sessionID, publicID, callback) {
  store.set(redisAction.getSessionIDString(meetingID, sessionID), publicID, function(err, reply) {
    store.set(redisAction.getPublicIDString(meetingID, publicID), sessionID, function(err, reply) {
      if(callback) callback();
    });
  });
};

/**
 * Get the session ID from the public ID of a user
 * @param  {string}   meetingID the ID of the meeting
 * @param  {string}   publicID  the unique public ID of the user
 * @param  {Function} callback  callback function
 * @return {undefined}          callback is called with return value if applicable
 */
exports.getSessionIDFromPublicID = function(meetingID, publicID, callback) {
  store.get(redisAction.getPublicIDString(meetingID, publicID), function(err, sessionID) {
    callback(sessionID);
  });
};

/**
 * Get the public ID from the session ID of a user
 * @param  {string}   meetingID the ID of the meeting
 * @param  {string}   sessionID the sessionID (unique ID) of the user
 * @param  {Function} callback  callback function
 * @return {undefined}          callback is called with return value if applicable
 */
exports.getPublicIDFromSessionID = function(meetingID, sessionID, callback) {
  store.get(redisAction.getSessionIDString(meetingID, sessionID), function(err, publicID) {
    callback(publicID);
  });
};

/**
 * Set the presenter from the public ID only
 * @param {string}   meetingID the ID of the meeting
 * @param {string}   publicID  the unique public ID of the user
 * @param {Function} callback  callback function
 */
exports.setPresenterFromPublicID = function(meetingID, publicID, callback) {
  redisAction.getSessionIDFromPublicID(meetingID, publicID, function(sessionID) {
    redisAction.setPresenter(meetingID, sessionID, publicID, function(success) {
      if(success) {
        console.log('set presenter to ' + sessionID);
        if(callback) callback(true);
      }
      else {
        console.log('could not set presenter to ' + sessionID);
        if(callback) callback(false);
      }
    });
  });
};

exports.setCurrentTool = function(meetingID, tool, callback) {
  store.set(redisAction.getCurrentToolString(meetingID), tool, function(err, reply) {
    if(reply) {
      if(callback) callback(true);
    }
    else if(err) {
      console.log(err);
      if(callback) callback(null);
    }
  });
};

/**
 * Set the presenter
 * @param {string}   meetingID the ID of the meeting
 * @param {string}   sessionID the sessionID (unique ID) of the user
 * @param {string}   publicID  the unique public ID of the user
 * @param {Function} callback  callback function
 */
exports.setPresenter = function(meetingID, sessionID, publicID, callback) {
  store.hmset(redisAction.getPresenterString(meetingID), 'sessionID', sessionID, 'publicID', publicID, function(err, reply) {
    if(reply) {
      if(callback) callback(publicID);
    }
    else if(err) {
      console.log(err);
      if(callback) callback(false);
    }
  });
};

/**
 * Get the session ID (private) of the presenter
 * @param  {string}   meetingID the ID of the meeting
 * @param  {Function} callback  callback function
 * @return {undefined}          callback is called with return value if applicable
 */
exports.getPresenterSessionID = function(meetingID, callback) {
  store.hget(redisAction.getPresenterString(meetingID), 'sessionID', function(err, reply) {
    if(reply) {
      callback(reply);
    }
    else if(err) {
      console.log(err);
      callback(null);
    }
  });
};

/**
 * Get the public ID of the presenter
 * @param  {string}   meetingID the ID of the meeting
 * @param  {Function} callback  callback function
 * @return {undefined}          callback is called with return value if applicable
 */
exports.getPresenterPublicID = function(meetingID, callback) {
  store.hget(redisAction.getPresenterString(meetingID), 'publicID', function(err, reply) {
    if(reply) {
      callback(reply);
    }
    else if(err) {
      console.log(err);
      callback(null);
    }
  });
};

/**
 * Get the current tool of the meeting
 * @param  {string}   meetingID the ID of the meeting
 * @param  {Function} callback  callback function
 * @return {undefined}          callback is called with return value if applicable
 */
exports.getCurrentTool = function(meetingID, callback) {
  store.get(redisAction.getCurrentToolString(meetingID), function(err, reply) {
    if(reply) {
      callback(reply);
    }
    else if(err) {
      console.log(err);
      callback(null);
    }
  });
};

/**
 * Delete the item list
 * @param  {string}   meetingID      the ID of the meeting
 * @param  {string}   presentationID the unique ID of the presentation in the meeting
 * @param  {string}   pageID         the unique ID of the page in the presentation
 * @param  {string}   itemName       the name of the type of items being deleted
 * @param  {Function} callback       the callback function to be called when finished
 * @return {undefined}               callback is called with return value if applicable
 */
exports.deleteItemList = function(meetingID, presentationID, pageID, itemName, callback) {
  //delete the list which contains the item ids
  store.del(redisAction.getItemsStringFunction(itemName)(meetingID, presentationID, pageID), function(err, reply) {
    if(reply) {
      console.log("REDIS: Deleted the list of items: " + itemName);
    }
    if(err) console.log("REDIS ERROR: could not delete list of items: " + itemName);
  });
};

/**
 * Deletes the items by itemName and an array of itemIDs (use helper)
 * @param  {string} meetingID      the ID of the meeting
 * @param  {string} presentationID the unique ID of the presentation in the meeting
 * @param  {string} pageID         the unique ID of the page in the presentation
 * @param  {string} itemName       the name of the item
 * @param  {string} itemIDs        an array of itemIDs to delete
 * @return {undefined}             callback is called with return value if applicable
 */
exports.deleteItems = function(meetingID, presentationID, pageID, itemName, itemIDs) {
  //delete each item
  for (var j = itemIDs.length - 1; j >= 0; j--) {
    store.del(redisAction.getItemStringFunction(itemName)(meetingID, presentationID, pageID, itemIDs[j]), function(err, reply) {
      if(reply) console.log("REDIS: Deleted item: " + itemName);
      if(err) console.log("REDIS ERROR: could not delete item: " + itemName);
    });
  };
};

/**
 * Delete a meeting
 * @param  {string}   meetingID the ID of the meeting
 * @param  {Function} callback  callback function
 * @return {undefined}          callback is called with return value if applicable
 */
exports.deleteMeeting = function(meetingID, callback) {
  store.srem(redisAction.getMeetingsString(), meetingID, function(err, reply) {
    if(reply) {
      console.log("Deleted meeting " + meetingID + " from list of meetings.");
      if(callback) callback(true);
    }
    else if(err) {
      console.log("Meeting was not in the list of meetings.");
      if(callback) callback(false);
    }
  });
};

/**
 * Process of the meeting once all the users have left
 * For now, this simply deletes everything associated with the meeting from redis
 * @param  {string}              meetingID the ID of the meeting
 * @return {undefined}           callback is called with return value if applicable
 */
exports.processMeeting = function(meetingID) {
  store.del(redisAction.getPresenterString(meetingID), function(err, reply) {
    console.log('deleted presenter');
  });
  store.del(redisAction.getCurrentViewBoxString(meetingID), function(err, reply) {
    console.log('deleted viewbox');
  });
  store.del(redisAction.getCurrentToolString(meetingID), function(err, reply) {
    console.log('deleted current tool');
  });
  redisAction.deleteMeeting(meetingID);
  redisAction.getPresentationIDs(meetingID, function(presIDs) {
    for(var k = presIDs.length - 1; k >=0; k--) {
      redisAction.getPageIDs(meetingID, presIDs[k], function(presID, pageIDs) {
        for(var m = pageIDs.length - 1; m >= 0; m--) {
          items = ['messages', 'shapes'];
          var j = 0;
          for (var j = items.length - 1; j >= 0; j--) {
            //must iterate through all presentations and all pages
            redisAction.getItemIDs(meetingID, presID, pageIDs[m], items[j], function(meetingID, presentationID, pageID, itemIDs, itemName) {
              redisAction.deleteItems(meetingID, presentationID, pageID, itemName, itemIDs);
            });
          }
          lists = ['currentshapes', 'messages'];
          for (var n = lists.length - 1; n >= 0; n--) {
            redisAction.deleteItemList(meetingID, presID, pageIDs[m], lists[n]);
          }
        }
      });
      redisAction.deletePages(meetingID, presIDs[k]); //delete all the pages for the associated presentation
    }
  });
  redisAction.deletePresentations(meetingID); //delete all the presentations
};

/**
 * Get the item IDs from the item name
 * @param  {string}   meetingID      the ID of the meeting
 * @param  {string}   presentationID the unique ID of the presentation in the meeting
 * @param  {string}   pageID         the unique ID of the page in the presentation
 * @param  {string}   itemName       the name of the type of items getting the IDs of
 * @param  {Function} callback       the callback function to be called when finished
 * @return {undefined}               callback is called with return value if applicable
 */
exports.getItemIDs = function(meetingID, presentationID, pageID, itemName, callback) {
  store.lrange(redisAction.getItemsStringFunction(itemName)(meetingID, presentationID, pageID), 0, -1, function(err, itemIDs) {
    callback(meetingID, presentationID, pageID, itemIDs, itemName);
  });
};

/**
 * Get a list of the current users of the meeting
 * @param  {string}   meetingID the ID of the meeting
 * @param  {Function} callback  callback function
 * @return {undefined}             callback is called with return value if applicable
 */
exports.getCurrentUsers = function(meetingID, callback) {
  store.smembers(redisAction.getCurrentUsersString(meetingID), function(err, reply) {
    if(reply) {
      callback(reply);
    }
    else if(err) {
    }
  });
};

/**
 * Set the image size to a image in a page
 * @param {string}   meetingID      the ID of the meeting
 * @param {string}   presentationID the unique ID of the presentation in the meeting
 * @param {string}   pageID         the unique ID of the page in the presentation
 * @param {string|number}   width   the value of the width of the image (in pixels)
 * @param {string|number}   height  the value of the height of the image (in pixels)
 * @param {Function} callback       the callback function to be called when finished
 */
exports.setImageSize = function(meetingID, presentationID, pageID, width, height, callback) {
  store.set(redisAction.getPageWidthString(meetingID, presentationID, pageID), width, function(err, reply) {
    store.set(redisAction.getPageHeightString(meetingID, presentationID, pageID), height, function(err, reply) {
      console.log('set size');
      if(callback) callback(true);
    });
  });
};

/**
 * Get a image size from the image on the page
 * @param  {string}   meetingID      the ID of the meeting
 * @param  {string}   presentationID the unique ID of the presentation in the meeting
 * @param  {string}   pageID         the unique ID of the page in the presentation
 * @param  {Function} callback       the callback function to be called when finished
 * @return {undefined}               callback is called with return value if applicable
 */
exports.getImageSize = function(meetingID, presentationID, pageID, callback) {
  store.get(redisAction.getPageWidthString(meetingID, presentationID, pageID), function(err, width) {
    store.get(redisAction.getPageHeightString(meetingID, presentationID, pageID), function(err, height) {
      callback(width, height);
    });
  });
};

/**
 * Get presentation IDs for a meeting
 * @param  {string}   meetingID the ID of the meeting
 * @param  {Function} callback  callback function
 * @return {undefined}          callback is called with return value if applicable
 */
exports.getPresentationIDs = function(meetingID, callback) {
  store.smembers(redisAction.getPresentationsString(meetingID), function(err, presIDs) {
    callback(presIDs);
  });
};

/**
 * Get the page IDs for a presentation
 * @param  {string}   meetingID      the ID of the meeting
 * @param  {string}   presentationID the unique ID of the presentation in the meeting
 * @param  {Function} callback       the callback function to be called when finished
 * @return {undefined}               callback is called with return value if applicable
 */
exports.getPageIDs = function(meetingID, presentationID, callback) {
  store.lrange(redisAction.getPagesString(meetingID, presentationID), 0, -1, function(err, pageIDs) {
    callback(presentationID, pageIDs);
  });
};

/**
 * Checks the Redis datastore whether the session is valid
 * @param  {string}   meetingID the ID of the meeting
 * @param  {string}   sessionID the sessionID (unique ID) of the user
 * @param  {Function} callback  callback function returns true if valid session
 * @return {undefined}          callback is used to return value
 */
exports.isValidSession = function(meetingID, sessionID, callback) {
  store.sismember(redisAction.getUsersString(meetingID), sessionID, function(err, isValid) {
    callback(isValid);
  });
};

/**
 * Calls a callback returning whether the 
 * meeting is running or not (true => running)
 * @param  {string}   meetingID the ID of the meeting
 * @param  {Function} callback  callback function returns true if meeting is running
 * @return {undefined}          callback is used to return value
 */
exports.isMeetingRunning = function(meetingID, callback) {
  store.sismember(redisAction.getMeetingsString(), meetingID, function(err, reply) {
    if(reply == 1) {
      callback(true);
    }
    else if(reply == 0) {
      callback(false);
    }
  });
};

/**
 * Delete all page references from a presentation.
 * @param  {string}   meetingID      the ID of the meeting
 * @param  {string}   presentationID the unique ID of the presentation in the meeting
 * @param  {Function} callback       the callback function to be called when finished
 * @return {undefined}               callback is called with return value if applicable
 */
exports.deletePages = function(meetingID, presentationID, callback) {
  //delete each page image
  redisAction.getPageIDs(meetingID, presentationID, function(presentationID, pageIDs) {
    for (var i = pageIDs.length - 1; i >= 0; i--) {
      redisAction.deletePageImage(meetingID, presentationID, pageIDs[i]);
    };
    //delete list of pages
    store.del(redisAction.getPagesString(meetingID, presentationID), function(err, reply) {
      if(reply) console.log("REDIS: Deleted all pages");
      if(err) console.log("REDIS ERROR: Couldn't delete all pages");
      //delete currentpage
      store.del(redisAction.getCurrentPageString(meetingID, presentationID), function(err, reply) {
        if(reply) console.log("REDIS: Deleted current page");
        if(err) console.log("REDIS ERROR: Couldn't delete current page");
        if(callback) callback();
      });
    });
  });
};

/**
 * Delete the reference to the image from a
 * particular presentation page in a meeting
 * @param  {string}   meetingID      the ID of the meeting
 * @param  {string}   presentationID the unique ID of the presentation in the meeting
 * @param  {string}   pageID         the unique ID of the page in the presentation
 * @param  {Function} callback       the callback function to be called when finished
 * @return {undefined}               callback is called with return value if applicable
 */
exports.deletePageImage = function(meetingID, presentationID, pageID, callback) {
  store.del(redisAction.getPageImageString(meetingID, presentationID, pageID), function(err, reply) {
    if(reply) console.log("REDIS: Deleted page image");
    if(err) console.log("REDIS ERROR: Could not delete page image");
    if(callback) callback();
  });
};

/**
 * Delete all presentation references from the meeting
 * @param  {string}   meetingID the ID of the meeting
 * @param  {Function} callback  callback function
 * @return {undefined}          callback is called with return value if applicable
 */
exports.deletePresentations = function(meetingID, callback) {
  store.del(redisAction.getPresentationsString(meetingID), function(err, reply) {
    if(reply) console.log("REDIS: Deleted all presentations");
    else console.log("REDIS ERROR: Couldn't delete all presentations");
    store.del(redisAction.getCurrentPresentationString(meetingID), function(err, reply) {
      if(reply) console.log("REDIS: Deleted current presentation");
      if(err) console.log("REDIS ERROR: Couldn't delete current presentation");
      if(callback) callback();
    });
  });
};

/**
 * Delete the user from Redis
 * @param  {string}   meetingID the ID of the meeting
 * @param  {string}   sessionID the sessionID (unique ID) of the user
 * @param  {Function} callback  callback function
 * @return {undefined}          callback is called with return value if applicable
 */
exports.deleteUser = function(meetingID, sessionID, callback) {
  store.srem(redisAction.getUsersString(meetingID), sessionID, function(err, num_deleted) {
    store.del(redisAction.getUserString(meetingID, sessionID), function(err, reply) {
		  callback(true);
    });
  });
};

/**
 * Remove the current user from the list of current user
 * @param  {string}   meetingID the ID of the meeting
 * @param  {string}   sessionID the sessionID (unique ID) of the user
 * @param  {Function} callback  callback function
 * @return {undefined}          callback is called with return value if applicable
 */
exports.deleteCurrentUser = function(meetingID, sessionID, callback) {
  store.srem(redisAction.getCurrentUsersString(meetingID), sessionID, function(err, num_deleted) {
    callback(true);
  });
};

/**
 * Gets all the properties associated with a specific user (sessionID)
 * @param  {string}   meetingID the ID of the meeting
 * @param  {string}   sessionID the sessionID (unique ID) of the user
 * @param  {Function} callback  callback function
 * @return {undefined}             callback is called with return value if applicable
 */
exports.getUserProperties = function(meetingID, sessionID, callback) {
  store.hgetall(redisAction.getUserString(meetingID, sessionID), function(err, properties) {
    callback(properties);
  });
};

/**
 * Gets a single property from a specific user
 * @param  {string}   meetingID the ID of the meeting
 * @param  {string}   sessionID the sessionID (unique ID) of the user
 * @param  {string}   property  the name of the property from the users list of properties to get
 * @param  {Function} callback  callback function
 * @return {undefined}          callback is called with return value if applicable
 */
exports.getUserProperty = function(meetingID, sessionID, property, callback) {
  store.hget(redisAction.getUserString(meetingID, sessionID), property, function(err, prop) {
    if(prop) callback(prop);
    if(err) {
      console.log(err);
      callback(null);
    }
  });
};

/**
 * Get all users and their data in an array
 * (users are in a set, not a list, because they need to be accessed with O(1))
 * @param  {string}   meetingID the ID of the meeting
 * @param  {Function} callback  callback function
 * @return {undefined}          callback is called with return value if applicable
 */
exports.getUsers =  function (meetingID, callback) {
  users = [];
  usercount = 0;
  usersdone = 0;

  store.smembers(redisAction.getUsersString(meetingID), function (err, userids) {
    usercount = userids.length;
    for (var i = usercount - 1; i >= 0; i--){
      store.hgetall(redisAction.getUserString(meetingID, userids[i]), function (err, props) {
        users.push(props);
        usersdone++;
        if (usercount == usersdone) {
          callback(users);
        }
      });
    };
  });
};

/**
 * Get the page image filename 
 * @param  {string}   meetingID      the ID of the meeting
 * @param  {string}   presentationID the unique ID of the presentation in the meeting
 * @param  {string}   pageID         the unique ID of the page in the presentation
 * @param  {Function} callback       the callback function to be called when finished
 * @return {undefined}               callback is called with return value if applicable
 */
exports.getPageImage = function(meetingID, presentationID, pageID, callback) {
  store.get(redisAction.getPageImageString(meetingID, presentationID, pageID), function(err, filename) {
    if(filename) {
      console.log(filename);
      callback(pageID, filename);
    }
    else console.log("REDIS ERROR: Couldn't get page image");
  });
};

/**
 * Get array of items by item name and meeting id
 * @param  {string}   meetingID      the ID of the meeting
 * @param  {string}   presentationID the unique ID of the presentation in the meeting
 * @param  {string}   pageID         the unique ID of the page in the presentation
 * @param  {string}   item           the name of the type of item
 * @param  {Function} callback       the callback function to be called when finished
 * @return {undefined}               callback is called with return value if applicable
 */
exports.getItems = function(meetingID, presentationID, pageID, item, callback) {
  var items = [];
  var itemCount = 0;
  var itemsDone = 0;
  var itemsGetFunction;
  var itemGetFunction;
 
  itemGetFunction = redisAction.getItemStringFunction(item);
  itemsGetFunction = redisAction.getItemsStringFunction(item);
 
  store.lrange(itemsGetFunction(meetingID, presentationID, pageID), 0, -1, function (err, itemIDs) {
    itemCount = itemIDs.length;
    if(itemCount == 0) callback([]);
    for (var i = itemCount - 1; i >= 0; i--) {
      store.hgetall(itemGetFunction(meetingID, presentationID, pageID, itemIDs[i]), function(err, itemHash) {
        items.push(itemHash);
        itemsDone++;
        if (itemCount == itemsDone) {
          callback(items);
        }
      });
    };
  });
};

/**
 * Get the current presentation ID for the meeting
 * @param  {string}   meetingID the ID of the meeting
 * @param  {Function} callback  callback function
 * @return {undefined}          callback is called with return value if applicable
 */
exports.getCurrentPresentationID = function(meetingID, callback) {
  store.get(redisAction.getCurrentPresentationString(meetingID), function(err, currPresID) {
    if(currPresID) {
      callback(currPresID);
    }
    else console.log("REDIS ERROR: Couldn't get current presentationID");
  });
};

/**
 * Change to the next page in the presentation
 * @param  {string}   meetingID      the ID of the meeting
 * @param  {string}   presentationID the unique ID of the presentation in the meeting
 * @param  {Function} callback       the callback function to be called when finished
 * @return {undefined}               callback is called with return value if applicable
 */
exports.changeToNextPage = function(meetingID, presentationID, callback) {
  var pages = redisAction.getPagesString(meetingID, presentationID);
  store.lpop(pages, function(err, reply) {
    store.rpush(pages, reply, function(err, reply) {
      store.lindex(pages, 0, function(err, currPage){
        if(currPage) {
          callback(currPage);
        }
        else console.log("REDIS ERROR: Couldn't get current pageID");
      });
    });
  });
};

/**
 * Change to the previous page in the presentation
 * @param  {string}   meetingID      the ID of the meeting
 * @param  {string}   presentationID the unique ID of the presentation in the meeting
 * @param  {Function} callback       the callback function to be called when finished
 * @return {undefined}               callback is called with return value if applicable
 */
exports.changeToPrevPage = function(meetingID, presentationID, callback) {
  var pages = redisAction.getPagesString(meetingID, presentationID);
  //removes the last element and then returns it, only after appending it back
  //to the beginning of the same list
  store.rpoplpush(pages, pages, function(err, currPage) {
    if(currPage) {
      callback(currPage);
    }
    else console.log("REDIS ERROR: Couldn't get current pageID");
  });
};

/**
 * Get the current page of the presentation
 * @param  {string}   meetingID      the ID of the meeting
 * @param  {string}   presentationID the unique ID of the presentation in the meeting
 * @param  {Function} callback       the callback function to be called when finished
 * @return {undefined}               callback is called with return value if applicable
 */
exports.getCurrentPageID = function(meetingID, presentationID, callback) {
  //The first element in the pages is always the current page
  store.lindex(redisAction.getPagesString(meetingID, presentationID), 0, function(err, currPgID) {
    if(currPgID) {
      callback(currPgID);
    }
    else console.log("REDIS ERROR: Couldn't get current pageID");
  });
};

/**
 * Create a new presentation for a meeting,
 * and possibly set it as the current meeting
 * @param  {string}   meetingID  the ID of the meeting
 * @param  {boolean}  setCurrent set current presentation after creation (true or false)
 * @param  {Function} callback   the callback function to be called when finished
 * @return {undefined}           callback is called with return value if applicable
 */
exports.createPresentation = function(meetingID, setCurrent, callback) {
  var presentationID = rack(); //create a new unique presentationID
  store.sadd(redisAction.getPresentationsString(meetingID), presentationID, function(err, reply) {
    if(reply) {
      console.log("REDIS: Added presentationID " + presentationID + " to set of presentations.");
      if(setCurrent) {
        redisAction.setCurrentPresentation(meetingID, presentationID, function() {
          callback(presentationID);
        });
      }
      else callback(presentationID);
    }
    else if(err) {
      console.log("REDIS ERROR: Couldn't add presentationID " + presentationID + "to set of presentations");
      callback(null);
    }
  });
};

/**
 * Set the current page of the presentation
 * @param {string}   meetingID      the ID of the meeting
 * @param {string}   presentationID the unique ID of the presentation in the meeting
 * @param {string}   pageID         the unique ID of the page in the presentation
 * @param {Function} callback       the callback function to be called when finished
 */
exports.setCurrentPage = function(meetingID, presentationID, pageID, callback) {
  store.set(redisAction.getCurrentPageString(meetingID, presentationID), pageID, function(err, reply) {
      if(reply) console.log("REDIS: Set current pageID to " + pageID);
      if(err) console.log("REDIS ERROR: Couldn't set current pageID to " + pageID);
      if(callback) callback();
    });
};

/**
 * Create a page for a presentation in a meeting
 * @param  {string}   meetingID      the ID of the meeting
 * @param  {string}   presentationID the unique ID of the presentation in the meeting
 * @param  {string}   imageName      the file name of the image
 * @param  {boolean}  setCurrent     set as current page after creating the page (true or false)
 * @param  {Function} callback       the callback function to be called when finished
 * @return {undefined}               callback is called with return value if applicable
 */
exports.createPage = function(meetingID, presentationID, imageName, setCurrent, callback) {
  var pageID = rack(); //create a new unique pageID
  var afterPush = function(err, reply) {
    if(reply) {
      console.log("REDIS: Created page with ID " + pageID);
      redisAction.setPageImage(meetingID, presentationID, pageID, imageName, function() {
        callback(pageID, imageName);
      });
    }
    else if(err) {
      console.log("REDIS ERROR: Couldn't create page with ID " + pageID);
      callback(null);
    }
  };
 
  console.log("Making page with id " + pageID);
  if(setCurrent) {
    store.lpush(redisAction.getPagesString(meetingID, presentationID), pageID, afterPush);
  }
  else {
    store.rpush(redisAction.getPagesString(meetingID, presentationID), pageID, afterPush);
  }
};

/**
 * Set the image for a particular page ID
 * @param {string}   meetingID      the ID of the meeting
 * @param {string}   presentationID the unique ID of the presentation in the meeting
 * @param {string}   pageID         the unique ID of the page in the presentation
 * @param {string}   imageName      the file name of the image
 * @param {Function} callback       the callback function to be called when finished
 */
exports.setPageImage = function(meetingID, presentationID, pageID, imageName, callback) {
  store.set(redisAction.getPageImageString(meetingID, presentationID, pageID), imageName, function (err, reply) {
    if(reply) console.log("REDIS: Set page " + pageID +" image to " + imageName);
    else if(err) console.log("REDIS ERROR: Couldn't set page " + pageID +" image to " + imageName);
    if(callback) callback();
  });
};

/**
 * Set the current presentation
 * @param {string}   meetingID      the ID of the meeting
 * @param {string}   presentationID the unique ID of the presentation in the meeting
 * @param {Function} callback       the callback function to be called when finished
 */
exports.setCurrentPresentation = function(meetingID, presentationID, callback) {
  store.set(redisAction.getCurrentPresentationString(meetingID), presentationID, function(err, reply) {
    if(reply) console.log("REDIS: Set current presentationID to " + presentationID);
    else if(err) console.log("REDIS ERROR: Couldn't set current presentationID"); //impossible because set never fails
    if(callback) callback();
  });
};

/**
 * Set the value of the current viewbox for the meeting
 * @param {string}   meetingID the ID of the meeting
 * @param {string}   viewbox   the string representing the viewbox value
 * @param {Function} callback  callback function
 */
exports.setViewBox = function(meetingID, viewbox, callback) {
  store.set(redisAction.getCurrentViewBoxString(meetingID), viewbox, function(err, reply){
    if(reply) {
      if(callback) callback(true);
    }
    else if(err) {
      console.log(err);
      if(callback) callback(false);
    }
  });
};

/**
 * Get the current viewbox of the meeting
 * @param  {string}   meetingID the ID of the meeting
 * @param  {Function} callback  callback function
 * @return {undefined}          callback is called with return value if applicable
 */
exports.getViewBox = function(meetingID, callback) {
  store.get(redisAction.getCurrentViewBoxString(meetingID), function(err, reply) {
    if(reply) {
      if(callback) callback(reply);
    }
    else if(err) {
      console.log(err);
      if(callback) callback(null);
    }
  });
};

/**
 * Create a reference to a meeting
 * @param  {string}   meetingID the ID of the meeting
 * @param  {Function} callback  callback function
 * @return {undefined}          callback is called with return value if applicable
 */
exports.createMeeting = function(meetingID, callback) {
  store.sadd(redisAction.getMeetingsString(), meetingID); //create the meeting if not already created.
  if(callback) callback();
};

/**
 * Create a reference to a user
 * @param  {string}   meetingID the ID of the meeting
 * @param  {string}   userID    the unique session ID of the user
 * @param  {Function} callback  callback function
 * @return {undefined}          callback is called with return value if applicable
 */
exports.createUser = function(meetingID, userID, callback) {
  store.sadd(redisAction.getUsersString(meetingID), userID); //meeting-123-users.push(sessionID)
  if(callback) callback();
};

/**
 * Update user properties
 * @param  {string}   meetingID  the ID of the meeting
 * @param  {string}   userID     the unique session ID of the user
 * @param  {Object}   properties a hash of properties to set as the users properties
 * @param  {Function} callback   the callback function to be called when finished
 * @return {undefined}           callback is called with return value if applicable
 */
exports.updateUserProperties = function(meetingID, userID, properties, callback) {
  properties.unshift(redisAction.getUserString(meetingID, userID));
  properties.push(function(err, reply) {
    if(reply) {
      if(callback) callback(true);
    }
    else if(err) {
      console.log(err);
      if(callback) callback(false);
    }
  });
  store.hmset.apply(store, properties);
};
