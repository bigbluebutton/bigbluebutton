###
Returns the function for getting the string of a specific
item given the name of the item type in Redis.
@param  {string} itemString the name of the item
@return {Function}          the function used to get the key for a specific item from Redis
###
exports.getItemStringFunction = (itemString) ->
  functions =
    messages: redisAction.getMessageString
    shapes: redisAction.getShapeString
    currentshapes: redisAction.getShapeString
  functions[itemString]

###
Returns the function for getting the string of all the items
given the name of the items in Redis
@param  {string} itemString the name of the item
@return {Function}          the function used to get the key for the list of specific items in Redis
###
exports.getItemsStringFunction = (itemString) ->
  functions =
    messages: redisAction.getMessagesString
    shapes: redisAction.getCurrentShapesString
    currentshapes: redisAction.getCurrentShapesString
  functions[itemString]

###
Get the key for the list of meetings in Redis
@return {string} the key for the list of meetings in Redis
###
exports.getMeetingsString = ->
  "meetings"

###
Get the string representing the key for the meeting
given the meetingID in Redis
@param  {string} meetingID the ID of the meeting
@return {string}           the key for the meeting given the meetingID in Redis
###
exports.getMeetingString = (meetingID) ->
  "meeting-" + meetingID

###
Get the string representing the key for the hash of all
the users for a specified meetingID in Redis
@param  {string} meetingID the ID of the meeting
@return {string}           the key for the hash of all the users for a specified meetingID in Redis
###
exports.getUsersString = (meetingID) ->
  "meeting-" + meetingID + "-users"

###
Get the string representing the key for a specific sessionID in Redis
@param  {string} meetingID the ID of the meeting
@param  {string} sessionID the sessionID (unique ID) of the user
@return {string}           the key for a specific sessionID in Redis
###
exports.getUserString = (meetingID, sessionID) ->
  "meeting-" + meetingID + "-user-" + sessionID

###
Get the string representing the key for the list of current users
in a specific meeting ID
@param  {string} meetingID the ID of the meeting
@return {string}           key for the list of current users in a specific meeting ID
###
exports.getCurrentUsersString = (meetingID) ->
  "meeting-" + meetingID + "-currentusers"

###
Get the string representing the key for the hash of all
the messages for a specified meetingID in Redis
@param  {string} meetingID      the ID of the meeting
@param  {string} presentationID the unique ID of the presentation in the meeting
@param  {string} pageID         the unique ID of the page in the presentation
@return {string}                the key for the hash of all the messages for a specified meetingID in Redis
###
exports.getMessagesString = (meetingID, presentationID, pageID) ->
  "meeting-" + meetingID + "-messages"

###
Get the string representing the key for a specific message in Redis
@param  {string} meetingID      the ID of the meeting
@param  {string} presentationID the unique ID of the presentation in the meeting
@param  {string} pageID         the unique ID of the page in the presentation
@param  {string} messageID      the unique ID of the message in the public chat
@return {string}                string representing the key for a specific message in Redis
###
exports.getMessageString = (meetingID, presentationID, pageID, messageID) ->
  "meeting-" + meetingID + "-message-" + messageID

###
Get the key for the list of presentations for a meeting ID
@param  {string} meetingID the ID of the meeting
@return {string}           key for the list of presentations for a meeting ID
###
exports.getPresentationsString = (meetingID) ->
  "meeting-" + meetingID + "-presentations"

###
Get the key for a specific presentation in a meeting
@param  {string} meetingID      the ID of the meeting
@param  {string} presentationID the unique ID of the presentation in the meeting
@return {string}                key for a specific presentation in a meeting
###
exports.getPresentationString = (meetingID, presentationID) ->
  "meeting-" + meetingID + "-presentation-" + presentationID

###
Get the key for the pages in a specific presentation in a meeting
@param  {string} meetingID      the ID of the meeting
@param  {string} presentationID the unique ID of the presentation in the meeting
@return {string}                key for the pages in a specific presentation in a meeting
###
exports.getPagesString = (meetingID, presentationID) ->
  "meeting-" + meetingID + "-presentation-" + presentationID + "-pages"

###
Get the key for the current presentation of the meeting
@param  {string} meetingID the ID of the meeting
@return {string}           key for the current presentation of the meeting
###
exports.getCurrentPresentationString = (meetingID) ->
  "meeting-" + meetingID + "-currentpresentation"

###
Get the key for the current page in the presentation
@param  {string} meetingID      the ID of the meeting
@param  {string} presentationID the unique ID of the presentation in the meeting
@return {string}                key for the current page in the presentation
###
exports.getCurrentPageString = (meetingID, presentationID) ->
  "meeting-" + meetingID + "-presentation-" + presentationID + "-currentpage"

###
Get key of specific page.
@param  {string} meetingID      the ID of the meeting
@param  {string} presentationID the unique ID of the presentation in the meeting
@param  {string} pageID         the unique ID of the page in the presentation
@return {string}                key of specific page.
###
exports.getPageString = (meetingID, presentationID, pageID) ->
  "meeting-" + meetingID + "-presentation-" + presentationID + "-page-" + pageID

###
Get key of page image.
@param  {string} meetingID      the ID of the meeting
@param  {string} presentationID the unique ID of the presentation in the meeting
@param  {string} pageID         the unique ID of the page in the presentation
@return {string}                key of page image.
###
exports.getPageImageString = (meetingID, presentationID, pageID) ->
  "meeting-" + meetingID + "-presentation-" + presentationID + "-page-" + pageID + "-image"

###
Get key for list of current shapes for the page
@param  {string} meetingID      the ID of the meeting
@param  {string} presentationID the unique ID of the presentation in the meeting
@param  {string} pageID         the unique ID of the page in the presentation
@return {string}                key for list of current shapes for the page
###
exports.getCurrentShapesString = (meetingID, presentationID, pageID) ->
  "meeting-" + meetingID + "-presentation-" + presentationID + "-page-" + pageID + "-currentshapes"

###
Get key for specific shape on page
@param  {string} meetingID      the ID of the meeting
@param  {string} presentationID the unique ID of the presentation in the meeting
@param  {string} pageID         the unique ID of the page in the presentation
@param  {string} shapeID        the unique ID of the shape in the page
@return {string}                key for specific shape on page
###
exports.getShapeString = (meetingID, presentationID, pageID, shapeID) ->
  "meeting-" + meetingID + "-presentation-" + presentationID + "-page-" + pageID + "-shape-" + shapeID

###
Get the key for the current viewbox
@param  {string} meetingID the ID of the meeting
@return {string}           the key for the current viewbox
###
exports.getCurrentViewBoxString = (meetingID) ->
  "meeting-" + meetingID + "-viewbox"

###
Get the key for the current tool
@param  {string} meetingID the ID of the meeting
@return {string}           the key for the current tool
###
exports.getCurrentToolString = (meetingID) ->
  "meeting-" + meetingID + "-currenttool"

###
Get the key for the presenter
@param  {string} meetingID the ID of the meeting
@return {string}           the key for the presenter
###
exports.getPresenterString = (meetingID) ->
  "meeting-" + meetingID + "-presenter"

###
Get the key for the public ID for a user
@param  {string} meetingID the ID of the meeting
@param  {string} publicID  the unique public ID of the user
@return {string}           the key for the public ID for a user
###
exports.getPublicIDString = (meetingID, publicID) ->
  "meeting-" + meetingID + "-publicID-" + publicID

###
Get the key for session ID for a user
@param  {string} meetingID the ID of the meeting
@param  {string} sessionID the sessionID (unique ID) of the user
@return {string}           the key for session ID for a user
###
exports.getSessionIDString = (meetingID, sessionID) ->
  "meeting-" + meetingID + "-sessionID-" + sessionID

###
Get the key for the width of a page image
@param  {string} meetingID      the ID of the meeting
@param  {string} presentationID the unique ID of the presentation in the meeting
@param  {string} pageID         the unique ID of the page in the presentation
@return {string}                the key for the width of a page image
###
exports.getPageWidthString = (meetingID, presentationID, pageID) ->
  "meeting-" + meetingID + "-presentation-" + presentationID + "-page-" + pageID + "-width"

###
Get the key for the height of a page image
@param  {string} meetingID      the ID of the meeting
@param  {string} presentationID the unique ID of the presentation in the meeting
@param  {string} pageID         the unique ID of the page in the presentation
@return {string}                the key for the height of a page image
###
exports.getPageHeightString = (meetingID, presentationID, pageID) ->
  "meeting-" + meetingID + "-presentation-" + presentationID + "-page-" + pageID + "-height"

###
Set the public and session ID to match one another
for lookup later
@param {string}   meetingID the ID of the meeting
@param {string}   sessionID the sessionID (unique ID) of the user
@param {string}   publicID  the unique public ID of the user
@param {Function} callback  callback function
###
exports.setIDs = (meetingID, sessionID, publicID, callback) ->
  store.set redisAction.getSessionIDString(meetingID, sessionID), publicID, (err, reply) ->
    store.set redisAction.getPublicIDString(meetingID, publicID), sessionID, (err, reply) ->
      callback?()

###
Get the session ID from the public ID of a user
@param  {string}   meetingID the ID of the meeting
@param  {string}   publicID  the unique public ID of the user
@param  {Function} callback  callback function
@return {undefined}          callback is called with return value if applicable
###
exports.getSessionIDFromPublicID = (meetingID, publicID, callback) ->
  store.get redisAction.getPublicIDString(meetingID, publicID), (err, sessionID) ->
    callback?(sessionID)

###
Get the public ID from the session ID of a user
@param  {string}   meetingID the ID of the meeting
@param  {string}   sessionID the sessionID (unique ID) of the user
@param  {Function} callback  callback function
@return {undefined}          callback is called with return value if applicable
###
exports.getPublicIDFromSessionID = (meetingID, sessionID, callback) ->
  store.get redisAction.getSessionIDString(meetingID, sessionID), (err, publicID) ->
    callback?(publicID)

###
Set the presenter from the public ID only
@param {string}   meetingID the ID of the meeting
@param {string}   publicID  the unique public ID of the user
@param {Function} callback  callback function
###
exports.setPresenterFromPublicID = (meetingID, publicID, callback) ->
  redisAction.getSessionIDFromPublicID meetingID, publicID, (sessionID) ->
    redisAction.setPresenter meetingID, sessionID, publicID, (success) ->
      if success
        console.log "set presenter to " + sessionID
        callback?(true)
      else
        console.log "could not set presenter to " + sessionID
        callback?(false)

exports.setCurrentTool = (meetingID, tool, callback) ->
  store.set redisAction.getCurrentToolString(meetingID), tool, (err, reply) ->
    if reply
      callback?(true)
    else if err
      console.log err
      callback?(null)

###
Set the presenter
@param {string}   meetingID the ID of the meeting
@param {string}   sessionID the sessionID (unique ID) of the user
@param {string}   publicID  the unique public ID of the user
@param {Function} callback  callback function
###
exports.setPresenter = (meetingID, sessionID, publicID, callback) ->
  store.hmset redisAction.getPresenterString(meetingID), "sessionID", sessionID, "publicID", publicID, (err, reply) ->
    if reply
      callback?(publicID)
    else if err
      console.log err
      callback?(false)

###
Get the session ID (private) of the presenter
@param  {string}   meetingID the ID of the meeting
@param  {Function} callback  callback function
@return {undefined}          callback is called with return value if applicable
###
exports.getPresenterSessionID = (meetingID, callback) ->
  store.hget redisAction.getPresenterString(meetingID), "sessionID", (err, reply) ->
    if reply
      callback?(reply)
    else if err
      console.log err
      callback?(null)

###
Get the public ID of the presenter
@param  {string}   meetingID the ID of the meeting
@param  {Function} callback  callback function
@return {undefined}          callback is called with return value if applicable
###
exports.getPresenterPublicID = (meetingID, callback) ->
  store.hget redisAction.getPresenterString(meetingID), "publicID", (err, reply) ->
    if reply
      callback?(reply)
    else if err
      console.log err
      callback?(null)

###
Get the current tool of the meeting
@param  {string}   meetingID the ID of the meeting
@param  {Function} callback  callback function
@return {undefined}          callback is called with return value if applicable
###
exports.getCurrentTool = (meetingID, callback) ->
  store.get redisAction.getCurrentToolString(meetingID), (err, reply) ->
    if reply
      callback?(reply)
    else if err
      console.log err
      callback?(null)

###
Delete the item list
@param  {string}   meetingID      the ID of the meeting
@param  {string}   presentationID the unique ID of the presentation in the meeting
@param  {string}   pageID         the unique ID of the page in the presentation
@param  {string}   itemName       the name of the type of items being deleted
@param  {Function} callback       the callback function to be called when finished
@return {undefined}               callback is called with return value if applicable
###
exports.deleteItemList = (meetingID, presentationID, pageID, itemName, callback) ->

  #delete the list which contains the item ids
  store.del redisAction.getItemsStringFunction(itemName)(meetingID, presentationID, pageID), (err, reply) ->
    console.log "REDIS: Deleted the list of items: " + itemName  if reply
    console.log "REDIS ERROR: could not delete list of items: " + itemName  if err

###
Deletes the items by itemName and an array of itemIDs (use helper)
@param  {string} meetingID      the ID of the meeting
@param  {string} presentationID the unique ID of the presentation in the meeting
@param  {string} pageID         the unique ID of the page in the presentation
@param  {string} itemName       the name of the item
@param  {string} itemIDs        an array of itemIDs to delete
@return {undefined}             callback is called with return value if applicable
###
exports.deleteItems = (meetingID, presentationID, pageID, itemName, itemIDs) ->

  #delete each item
  j = itemIDs.length - 1

  while j >= 0
    store.del redisAction.getItemStringFunction(itemName)(meetingID, presentationID, pageID, itemIDs[j]), (err, reply) ->
      console.log "REDIS: Deleted item: " + itemName  if reply
      console.log "REDIS ERROR: could not delete item: " + itemName  if err

    j--

###
Delete a meeting
@param  {string}   meetingID the ID of the meeting
@param  {Function} callback  callback function
@return {undefined}          callback is called with return value if applicable
###
exports.deleteMeeting = (meetingID, callback) ->
  store.srem redisAction.getMeetingsString(), meetingID, (err, reply) ->
    if reply
      console.log "Deleted meeting " + meetingID + " from list of meetings."
      callback?(true)
    else if err
      console.log "Meeting was not in the list of meetings."
      callback?(false)

###
Process of the meeting once all the users have left
For now, this simply deletes everything associated with the meeting from redis
@param  {string}              meetingID the ID of the meeting
@return {undefined}           callback is called with return value if applicable
###
exports.processMeeting = (meetingID) ->
  store.del redisAction.getPresenterString(meetingID), (err, reply) ->
    console.log "deleted presenter"

  store.del redisAction.getCurrentViewBoxString(meetingID), (err, reply) ->
    console.log "deleted viewbox"

  store.del redisAction.getCurrentToolString(meetingID), (err, reply) ->
    console.log "deleted current tool"

  redisAction.deleteMeeting meetingID
  redisAction.getPresentationIDs meetingID, (presIDs) ->
    k = presIDs.length - 1

    while k >= 0
      redisAction.getPageIDs meetingID, presIDs[k], (presID, pageIDs) ->
        m = pageIDs.length - 1

        while m >= 0
          items = ["messages", "shapes"]
          j = 0
          j = items.length - 1

          while j >= 0

            #must iterate through all presentations and all pages
            redisAction.getItemIDs meetingID, presID, pageIDs[m], items[j], (meetingID, presentationID, pageID, itemIDs, itemName) ->
              redisAction.deleteItems meetingID, presentationID, pageID, itemName, itemIDs

            j--
          lists = ["currentshapes", "messages"]
          n = lists.length - 1

          while n >= 0
            redisAction.deleteItemList meetingID, presID, pageIDs[m], lists[n]
            n--
          m--

      redisAction.deletePages meetingID, presIDs[k] #delete all the pages for the associated presentation
      k--

  redisAction.deletePresentations meetingID #delete all the presentations

###
Get the item IDs from the item name
@param  {string}   meetingID      the ID of the meeting
@param  {string}   presentationID the unique ID of the presentation in the meeting
@param  {string}   pageID         the unique ID of the page in the presentation
@param  {string}   itemName       the name of the type of items getting the IDs of
@param  {Function} callback       the callback function to be called when finished
@return {undefined}               callback is called with return value if applicable
###
exports.getItemIDs = (meetingID, presentationID, pageID, itemName, callback) ->
  store.lrange redisAction.getItemsStringFunction(itemName)(meetingID, presentationID, pageID), 0, -1, (err, itemIDs) ->
    callback?(meetingID, presentationID, pageID, itemIDs, itemName)

###
Get a list of the current users of the meeting
@param  {string}   meetingID the ID of the meeting
@param  {Function} callback  callback function
@return {undefined}             callback is called with return value if applicable
###
exports.getCurrentUsers = (meetingID, callback) ->
  store.smembers redisAction.getCurrentUsersString(meetingID), (err, reply) ->
    if reply
      callback?(reply)
    else err

###
Set the image size to a image in a page
@param {string}   meetingID      the ID of the meeting
@param {string}   presentationID the unique ID of the presentation in the meeting
@param {string}   pageID         the unique ID of the page in the presentation
@param {string|number}   width   the value of the width of the image (in pixels)
@param {string|number}   height  the value of the height of the image (in pixels)
@param {Function} callback       the callback function to be called when finished
###
exports.setImageSize = (meetingID, presentationID, pageID, width, height, callback) ->
  store.set redisAction.getPageWidthString(meetingID, presentationID, pageID), width, (err, reply) ->
    store.set redisAction.getPageHeightString(meetingID, presentationID, pageID), height, (err, reply) ->
      console.log "set size"
      callback?(true)

###
Get a image size from the image on the page
@param  {string}   meetingID      the ID of the meeting
@param  {string}   presentationID the unique ID of the presentation in the meeting
@param  {string}   pageID         the unique ID of the page in the presentation
@param  {Function} callback       the callback function to be called when finished
@return {undefined}               callback is called with return value if applicable
###
exports.getImageSize = (meetingID, presentationID, pageID, callback) ->
  store.get redisAction.getPageWidthString(meetingID, presentationID, pageID), (err, width) ->
    store.get redisAction.getPageHeightString(meetingID, presentationID, pageID), (err, height) ->
      callback?(width, height)

###
Get presentation IDs for a meeting
@param  {string}   meetingID the ID of the meeting
@param  {Function} callback  callback function
@return {undefined}          callback is called with return value if applicable
###
exports.getPresentationIDs = (meetingID, callback) ->
  store.smembers redisAction.getPresentationsString(meetingID), (err, presIDs) ->
    callback?(presIDs)

###
Get the page IDs for a presentation
@param  {string}   meetingID      the ID of the meeting
@param  {string}   presentationID the unique ID of the presentation in the meeting
@param  {Function} callback       the callback function to be called when finished
@return {undefined}               callback is called with return value if applicable
###
exports.getPageIDs = (meetingID, presentationID, callback) ->
  store.lrange redisAction.getPagesString(meetingID, presentationID), 0, -1, (err, pageIDs) ->
    callback?(presentationID, pageIDs)

###
Checks the Redis datastore whether the session is valid
@param  {string}   meetingID the ID of the meeting
@param  {string}   sessionID the sessionID (unique ID) of the user
@param  {Function} callback  callback function returns true if valid session
@return {undefined}          callback is used to return value
###
exports.isValidSession = (meetingID, sessionID, callback) ->
  store.sismember redisAction.getUsersString(meetingID), sessionID, (err, isValid) ->
    callback?(isValid)

###
Calls a callback returning whether the
meeting is running or not (true => running)
@param  {string}   meetingID the ID of the meeting
@param  {Function} callback  callback function returns true if meeting is running
@return {undefined}          callback is used to return value
###
exports.isMeetingRunning = (meetingID, callback) ->
  store.sismember redisAction.getMeetingsString(), meetingID, (err, reply) ->
    if reply is 1
      callback?(true)
    else if reply is 0
      callback?(false)

###
Delete all page references from a presentation.
@param  {string}   meetingID      the ID of the meeting
@param  {string}   presentationID the unique ID of the presentation in the meeting
@param  {Function} callback       the callback function to be called when finished
@return {undefined}               callback is called with return value if applicable
###
exports.deletePages = (meetingID, presentationID, callback) ->

  #delete each page image
  redisAction.getPageIDs meetingID, presentationID, (presentationID, pageIDs) ->
    i = pageIDs.length - 1

    while i >= 0
      redisAction.deletePageImage meetingID, presentationID, pageIDs[i]
      i--

    #delete list of pages
    store.del redisAction.getPagesString(meetingID, presentationID), (err, reply) ->
      console.log "REDIS: Deleted all pages"  if reply
      console.log "REDIS ERROR: Couldn't delete all pages"  if err

      #delete currentpage
      store.del redisAction.getCurrentPageString(meetingID, presentationID), (err, reply) ->
        console.log "REDIS: Deleted current page"  if reply
        console.log "REDIS ERROR: Couldn't delete current page"  if err
        callback?()

###
Delete the reference to the image from a
particular presentation page in a meeting
@param  {string}   meetingID      the ID of the meeting
@param  {string}   presentationID the unique ID of the presentation in the meeting
@param  {string}   pageID         the unique ID of the page in the presentation
@param  {Function} callback       the callback function to be called when finished
@return {undefined}               callback is called with return value if applicable
###
exports.deletePageImage = (meetingID, presentationID, pageID, callback) ->
  store.del redisAction.getPageImageString(meetingID, presentationID, pageID), (err, reply) ->
    console.log "REDIS: Deleted page image"  if reply
    console.log "REDIS ERROR: Could not delete page image"  if err
    callback?()

###
Delete all presentation references from the meeting
@param  {string}   meetingID the ID of the meeting
@param  {Function} callback  callback function
@return {undefined}          callback is called with return value if applicable
###
exports.deletePresentations = (meetingID, callback) ->
  store.del redisAction.getPresentationsString(meetingID), (err, reply) ->
    if reply
      console.log "REDIS: Deleted all presentations"
    else
      console.log "REDIS ERROR: Couldn't delete all presentations"
    store.del redisAction.getCurrentPresentationString(meetingID), (err, reply) ->
      console.log "REDIS: Deleted current presentation" if reply?
      console.log "REDIS ERROR: Couldn't delete current presentation" if err?
      callback?()

###
Delete the user from Redis
@param  {string}   meetingID the ID of the meeting
@param  {string}   sessionID the sessionID (unique ID) of the user
@param  {Function} callback  callback function
@return {undefined}          callback is called with return value if applicable
###
exports.deleteUser = (meetingID, sessionID, callback) ->
  store.srem redisAction.getUsersString(meetingID), sessionID, (err, num_deleted) ->
    store.del redisAction.getUserString(meetingID, sessionID), (err, reply) ->
      callback?(true)

###
Remove the current user from the list of current user
@param  {string}   meetingID the ID of the meeting
@param  {string}   sessionID the sessionID (unique ID) of the user
@param  {Function} callback  callback function
@return {undefined}          callback is called with return value if applicable
###
exports.deleteCurrentUser = (meetingID, sessionID, callback) ->
  store.srem redisAction.getCurrentUsersString(meetingID), sessionID, (err, num_deleted) ->
    callback?(true)

###
Gets all the properties associated with a specific user (sessionID)
@param  {string}   meetingID the ID of the meeting
@param  {string}   sessionID the sessionID (unique ID) of the user
@param  {Function} callback  callback function
@return {undefined}             callback is called with return value if applicable
###
exports.getUserProperties = (meetingID, sessionID, callback) ->
  store.hgetall redisAction.getUserString(meetingID, sessionID), (err, properties) ->
    callback?(properties)

###
Gets a single property from a specific user
@param  {string}   meetingID the ID of the meeting
@param  {string}   sessionID the sessionID (unique ID) of the user
@param  {string}   property  the name of the property from the users list of properties to get
@param  {Function} callback  callback function
@return {undefined}          callback is called with return value if applicable
###
exports.getUserProperty = (meetingID, sessionID, property, callback) ->
  store.hget redisAction.getUserString(meetingID, sessionID), property, (err, prop) ->
    callback?(prop) if prop?
    if err
      console.log err
      callback?(null)

###
Get all users and their data in an array
(users are in a set, not a list, because they need to be accessed with O(1))
@param  {string}   meetingID the ID of the meeting
@param  {Function} callback  callback function
@return {undefined}          callback is called with return value if applicable
###
exports.getUsers = (meetingID, callback) ->
  users = []
  usercount = 0
  usersdone = 0
  store.smembers redisAction.getUsersString(meetingID), (err, userids) ->
    usercount = userids.length
    i = usercount - 1

    while i >= 0
      store.hgetall redisAction.getUserString(meetingID, userids[i]), (err, props) ->
        users.push props
        usersdone++
        if usercount is usersdone
          callback?(users)

      i--

###
Get the page image filename
@param  {string}   meetingID      the ID of the meeting
@param  {string}   presentationID the unique ID of the presentation in the meeting
@param  {string}   pageID         the unique ID of the page in the presentation
@param  {Function} callback       the callback function to be called when finished
@return {undefined}               callback is called with return value if applicable
###
exports.getPageImage = (meetingID, presentationID, pageID, callback) ->
  store.get redisAction.getPageImageString(meetingID, presentationID, pageID), (err, filename) ->
    if filename
      console.log filename
      callback?(pageID, filename)
    else
      console.log "REDIS ERROR: Couldn't get page image"

###
Get array of items by item name and meeting id
@param  {string}   meetingID      the ID of the meeting
@param  {string}   presentationID the unique ID of the presentation in the meeting
@param  {string}   pageID         the unique ID of the page in the presentation
@param  {string}   item           the name of the type of item
@param  {Function} callback       the callback function to be called when finished
@return {undefined}               callback is called with return value if applicable
###
exports.getItems = (meetingID, presentationID, pageID, item, callback) ->
  items = []
  itemCount = 0
  itemsDone = 0
  itemsGetFunction = undefined
  itemGetFunction = undefined
  itemGetFunction = redisAction.getItemStringFunction(item)
  itemsGetFunction = redisAction.getItemsStringFunction(item)
  store.lrange itemsGetFunction(meetingID, presentationID, pageID), 0, -1, (err, itemIDs) ->
    itemCount = itemIDs.length
    callback?([]) if itemCount is 0
    i = itemCount - 1

    while i >= 0
      store.hgetall itemGetFunction(meetingID, presentationID, pageID, itemIDs[i]), (err, itemHash) ->
        items.push itemHash
        itemsDone++
        if itemCount is itemsDone
          callback?(items)

      i--

###
Get the current presentation ID for the meeting
@param  {string}   meetingID the ID of the meeting
@param  {Function} callback  callback function
@return {undefined}          callback is called with return value if applicable
###
exports.getCurrentPresentationID = (meetingID, callback) ->
  store.get redisAction.getCurrentPresentationString(meetingID), (err, currPresID) ->
    if currPresID
      callback?(currPresID)
    else
      console.log "REDIS ERROR: Couldn't get current presentationID"

###
Change to the next page in the presentation
@param  {string}   meetingID      the ID of the meeting
@param  {string}   presentationID the unique ID of the presentation in the meeting
@param  {Function} callback       the callback function to be called when finished
@return {undefined}               callback is called with return value if applicable
###
exports.changeToNextPage = (meetingID, presentationID, callback) ->
  pages = redisAction.getPagesString(meetingID, presentationID)
  store.lpop pages, (err, reply) ->
    store.rpush pages, reply, (err, reply) ->
      store.lindex pages, 0, (err, currPage) ->
        if currPage
          callback?(currPage)
        else
          console.log "REDIS ERROR: Couldn't get current pageID"

###
Change to the previous page in the presentation
@param  {string}   meetingID      the ID of the meeting
@param  {string}   presentationID the unique ID of the presentation in the meeting
@param  {Function} callback       the callback function to be called when finished
@return {undefined}               callback is called with return value if applicable
###
exports.changeToPrevPage = (meetingID, presentationID, callback) ->
  pages = redisAction.getPagesString(meetingID, presentationID)

  #removes the last element and then returns it, only after appending it back
  #to the beginning of the same list
  store.rpoplpush pages, pages, (err, currPage) ->
    if currPage
      callback?(currPage)
    else
      console.log "REDIS ERROR: Couldn't get current pageID"

###
Get the current page of the presentation
@param  {string}   meetingID      the ID of the meeting
@param  {string}   presentationID the unique ID of the presentation in the meeting
@param  {Function} callback       the callback function to be called when finished
@return {undefined}               callback is called with return value if applicable
###
exports.getCurrentPageID = (meetingID, presentationID, callback) ->

  #The first element in the pages is always the current page
  store.lindex redisAction.getPagesString(meetingID, presentationID), 0, (err, currPgID) ->
    if currPgID
      callback?(currPgID)
    else
      console.log "REDIS ERROR: Couldn't get current pageID"

###
Create a new presentation for a meeting,
and possibly set it as the current meeting
@param  {string}   meetingID  the ID of the meeting
@param  {boolean}  setCurrent set current presentation after creation (true or false)
@param  {Function} callback   the callback function to be called when finished
@return {undefined}           callback is called with return value if applicable
###
exports.createPresentation = (meetingID, setCurrent, callback) ->
  presentationID = rack() #create a new unique presentationID
  store.sadd redisAction.getPresentationsString(meetingID), presentationID, (err, reply) ->
    if reply
      console.log "REDIS: Added presentationID " + presentationID + " to set of presentations."
      if setCurrent
        redisAction.setCurrentPresentation meetingID, presentationID, ->
          callback?(presentationID)
      else
        callback?(presentationID)
    else if err
      console.log "REDIS ERROR: Couldn't add presentationID " + presentationID + "to set of presentations"
      callback?(null)

###
Set the current page of the presentation
@param {string}   meetingID      the ID of the meeting
@param {string}   presentationID the unique ID of the presentation in the meeting
@param {string}   pageID         the unique ID of the page in the presentation
@param {Function} callback       the callback function to be called when finished
###
exports.setCurrentPage = (meetingID, presentationID, pageID, callback) ->
  store.set redisAction.getCurrentPageString(meetingID, presentationID), pageID, (err, reply) ->
    console.log "REDIS: Set current pageID to " + pageID  if reply
    console.log "REDIS ERROR: Couldn't set current pageID to " + pageID  if err
    callback?()

###
Create a page for a presentation in a meeting
@param  {string}   meetingID      the ID of the meeting
@param  {string}   presentationID the unique ID of the presentation in the meeting
@param  {string}   imageName      the file name of the image
@param  {boolean}  setCurrent     set as current page after creating the page (true or false)
@param  {Function} callback       the callback function to be called when finished
@return {undefined}               callback is called with return value if applicable
###
exports.createPage = (meetingID, presentationID, imageName, setCurrent, callback) ->
  pageID = rack() #create a new unique pageID
  afterPush = (err, reply) ->
    if reply
      console.log "REDIS: Created page with ID " + pageID
      redisAction.setPageImage meetingID, presentationID, pageID, imageName, ->
        callback?(pageID, imageName)

    else if err
      console.log "REDIS ERROR: Couldn't create page with ID " + pageID
      callback?(null)

  console.log "Making page with id " + pageID
  if setCurrent
    store.lpush redisAction.getPagesString(meetingID, presentationID), pageID, afterPush
  else
    store.rpush redisAction.getPagesString(meetingID, presentationID), pageID, afterPush

###
Set the image for a particular page ID
@param {string}   meetingID      the ID of the meeting
@param {string}   presentationID the unique ID of the presentation in the meeting
@param {string}   pageID         the unique ID of the page in the presentation
@param {string}   imageName      the file name of the image
@param {Function} callback       the callback function to be called when finished
###
exports.setPageImage = (meetingID, presentationID, pageID, imageName, callback) ->
  store.set redisAction.getPageImageString(meetingID, presentationID, pageID), imageName, (err, reply) ->
    if reply
      console.log "REDIS: Set page " + pageID + " image to " + imageName
    else console.log "REDIS ERROR: Couldn't set page " + pageID + " image to " + imageName  if err
    callback?()

###
Set the current presentation
@param {string}   meetingID      the ID of the meeting
@param {string}   presentationID the unique ID of the presentation in the meeting
@param {Function} callback       the callback function to be called when finished
###
exports.setCurrentPresentation = (meetingID, presentationID, callback) ->
  store.set redisAction.getCurrentPresentationString(meetingID), presentationID, (err, reply) ->
    if reply
      console.log "REDIS: Set current presentationID to " + presentationID
    else console.log "REDIS ERROR: Couldn't set current presentationID"  if err #impossible because set never fails
    callback?()

###
Set the value of the current viewbox for the meeting
@param {string}   meetingID the ID of the meeting
@param {string}   viewbox   the string representing the viewbox value
@param {Function} callback  callback function
###
exports.setViewBox = (meetingID, viewbox, callback) ->
  store.set redisAction.getCurrentViewBoxString(meetingID), viewbox, (err, reply) ->
    if reply
      callback?(true)
    else if err
      console.log err
      callback?(false)

###
Get the current viewbox of the meeting
@param  {string}   meetingID the ID of the meeting
@param  {Function} callback  callback function
@return {undefined}          callback is called with return value if applicable
###
exports.getViewBox = (meetingID, callback) ->
  store.get redisAction.getCurrentViewBoxString(meetingID), (err, reply) ->
    if reply
      callback?(reply)
    else if err
      console.log err
      callback?(null)

###
Create a reference to a meeting
@param  {string}   meetingID the ID of the meeting
@param  {Function} callback  callback function
@return {undefined}          callback is called with return value if applicable
###
exports.createMeeting = (meetingID, callback) ->
  store.sadd redisAction.getMeetingsString(), meetingID #create the meeting if not already created.
  callback?()

###
Create a reference to a user
@param  {string}   meetingID the ID of the meeting
@param  {string}   userID    the unique session ID of the user
@param  {Function} callback  callback function
@return {undefined}          callback is called with return value if applicable
###
exports.createUser = (meetingID, userID, callback) ->
  store.sadd redisAction.getUsersString(meetingID), userID #meeting-123-users.push(sessionID)
  callback?()

###
Update user properties
@param  {string}   meetingID  the ID of the meeting
@param  {string}   userID     the unique session ID of the user
@param  {Object}   properties a hash of properties to set as the users properties
@param  {Function} callback   the callback function to be called when finished
@return {undefined}           callback is called with return value if applicable
###
exports.updateUserProperties = (meetingID, userID, properties, callback) ->
  properties.unshift redisAction.getUserString(meetingID, userID)
  properties.push (err, reply) ->
    if reply
      callback?(true)
    else if err
      console.log err
      callback?(false)

  store.hmset.apply store, properties

exports.getMeetings = (callback) ->
  store.smembers "meetings", (err, meetingids) ->
    if meetingids
      index = 0
      resp = []
      f = (err, properties) ->
        unless index is meetingids.length
          r = {}
          r.meetingID = meetingids[index]
          r.externalID = properties["externalID"]
          r.meetingName = properties["name"]
          resp.push r
          index += 1
          store.hgetall "meeting-" + meetingids[index], f

      store.hgetall "meeting-" + meetingids[index], f
    else
      console.log err
      callback?([])
