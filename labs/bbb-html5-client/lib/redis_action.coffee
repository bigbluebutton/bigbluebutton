rack = require("hat").rack()

config = require("../config")

# TODO: some callbacks are not always called
# TODO: use standard success/error responses (e.g. sometimes failure returns `null`, sometimes `false`)
module.exports = class RedisAction
  constructor: () ->

  # Get the key for the list of meetings in redis
  # @return {string} the key for the list of meetings in redis
  getMeetingsString: ->
    "meetings"

  # Get the string representing the key for the meeting given the meetingID in redis
  # @param  {string} meetingID the ID of the meeting
  # @return {string}           the key for the meeting given the meetingID in redis
  getMeetingString: (meetingID) ->
    "meeting-#{meetingID}"

  # Get the string representing the key for the hash of all the users for a specified
  # meetingID in redis
  # @param  {string} meetingID the ID of the meeting
  # @return {string}           the key for the hash of all the users for a specified meetingID in redis
  getUsersString: (meetingID) ->
    "meeting-#{meetingID}-users"

  # Get the string representing the key for a specific sessionID in redis
  # @param  {string} meetingID the ID of the meeting
  # @param  {string} sessionID the sessionID (unique ID) of the user
  # @return {string}           the key for a specific sessionID in redis
  getUserString: (meetingID, sessionID) ->
    "meeting-#{meetingID}-user-#{sessionID}"

  # Get the string representing the key for the list of current users in a specific meeting ID
  # @param  {string} meetingID the ID of the meeting
  # @return {string}           key for the list of current users in a specific meeting ID
  getCurrentUsersString: (meetingID) ->
    "meeting-#{meetingID}-currentusers"

  # Get the string representing the key for the hash of all the messages for a specified
  # meetingID in redis.
  # Some parameters are not used but are kept in here to maintain the signature equal to
  # the signature of other methods, see `_getItemsStringFunction`.
  # @param  {string} meetingID      the ID of the meeting
  # @param  {string} presentationID not used
  # @param  {string} pageID         not used
  # @return {string}                the key for the hash of all the messages for a specified meetingID in redis
  getMessagesString: (meetingID, presentationID, pageID) ->
    "meeting-#{meetingID}-messages"

  # Get the string representing the key for a specific message in redis.
  # Some parameters are not used but are kept in here to maintain the signature equal to
  # the signature of other methods, see `_getItemStringFunction`.
  # @param  {string} meetingID      the ID of the meeting
  # @param  {string} presentationID not used
  # @param  {string} pageID         not used
  # @param  {string} messageID      the unique ID of the message in the public chat
  # @return {string}                string representing the key for a specific message in redis
  getMessageString: (meetingID, presentationID, pageID, messageID) ->
    "meeting-#{meetingID}-message-#{messageID}"

  # Get the key for the list of presentations for a meeting ID
  # @param  {string} meetingID the ID of the meeting
  # @return {string}           key for the list of presentations for a meeting ID
  getPresentationsString: (meetingID) ->
    "meeting-#{meetingID}-presentations"

  # Get the key for a specific presentation in a meeting
  # @param  {string} meetingID      the ID of the meeting
  # @param  {string} presentationID the unique ID of the presentation in the meeting
  # @return {string}                key for a specific presentation in a meeting
  getPresentationString: (meetingID, presentationID) ->
    "meeting-#{meetingID}-presentation-#{presentationID}"

  # Get the key for the pages in a specific presentation in a meeting
  # @param  {string} meetingID      the ID of the meeting
  # @param  {string} presentationID the unique ID of the presentation in the meeting
  # @return {string}                key for the pages in a specific presentation in a meeting
  getPagesString: (meetingID, presentationID) ->
    "meeting-#{meetingID}-presentation-#{presentationID}-pages"

  # Get the key for the current presentation of the meeting
  # @param  {string} meetingID the ID of the meeting
  # @return {string}           key for the current presentation of the meeting
  getCurrentPresentationString: (meetingID) ->
    "meeting-#{meetingID}-currentpresentation"

  # Get the key for the current page in the presentation
  # @param  {string} meetingID      the ID of the meeting
  # @param  {string} presentationID the unique ID of the presentation in the meeting
  # @return {string}                key for the current page in the presentation
  getCurrentPageString: (meetingID, presentationID) ->
    "meeting-#{meetingID}-presentation-#{presentationID}-currentpage"

  # Get key of specific page.
  # @param  {string} meetingID      the ID of the meeting
  # @param  {string} presentationID the unique ID of the presentation in the meeting
  # @param  {string} pageID         the unique ID of the page in the presentation
  # @return {string}                key of specific page.
  getPageString: (meetingID, presentationID, pageID) ->
    "meeting-#{meetingID}-presentation-#{presentationID}-page-#{pageID}"

  # Get key of page image.
  # @param  {string} meetingID      the ID of the meeting
  # @param  {string} presentationID the unique ID of the presentation in the meeting
  # @param  {string} pageID         the unique ID of the page in the presentation
  # @return {string}                key of page image.
  getPageImageString: (meetingID, presentationID, pageID) ->
    "meeting-#{meetingID}-presentation-#{presentationID}-page-#{pageID}-image"

  # Get key for list of current shapes for the page.
  # @param  {string} meetingID      the ID of the meeting
  # @param  {string} presentationID the unique ID of the presentation in the meeting
  # @param  {string} pageID         the unique ID of the page in the presentation
  # @return {string}                key for list of current shapes for the page
  getCurrentShapesString: (meetingID, presentationID, pageID) ->
    "meeting-#{meetingID}-presentation-#{presentationID}-page-#{pageID}-currentshapes"

  # Get key for specific shape on page.
  # @param  {string} meetingID      the ID of the meeting
  # @param  {string} presentationID the unique ID of the presentation in the meeting
  # @param  {string} pageID         the unique ID of the page in the presentation
  # @param  {string} shapeID        the unique ID of the shape in the page
  # @return {string}                key for specific shape on page
  getShapeString: (meetingID, presentationID, pageID, shapeID) ->
    "meeting-#{meetingID}-presentation-#{presentationID}-page-#{pageID}-shape-#{shapeID}"

  # Get the key for the current viewbox.
  # @param  {string} meetingID the ID of the meeting
  # @return {string}           the key for the current viewbox
  getCurrentViewBoxString: (meetingID) ->
    "meeting-#{meetingID}-viewbox"

  # Get the key for the current tool.
  # @param  {string} meetingID the ID of the meeting
  # @return {string}           the key for the current tool
  getCurrentToolString: (meetingID) ->
    "meeting-#{meetingID}-currenttool"

  # Get the key for the presenter.
  # @param  {string} meetingID the ID of the meeting
  # @return {string}           the key for the presenter
  getPresenterString: (meetingID) ->
    "meeting-#{meetingID}-presenter"

  # Get the key for the public ID for a user.
  # @param  {string} meetingID the ID of the meeting
  # @param  {string} publicID  the unique public ID of the user
  # @return {string}           the key for the public ID for a user
  getPublicIDString: (meetingID, publicID) ->
    "meeting-#{meetingID}-publicID-#{publicID}"

  # Get the key for session ID for a user.
  # @param  {string} meetingID the ID of the meeting
  # @param  {string} sessionID the sessionID (unique ID) of the user
  # @return {string}           the key for session ID for a user
  getSessionIDString: (meetingID, sessionID) ->
    "meeting-#{meetingID}-sessionID-#{sessionID}"

  # Get the key for the width of a page image.
  # @param  {string} meetingID      the ID of the meeting
  # @param  {string} presentationID the unique ID of the presentation in the meeting
  # @param  {string} pageID         the unique ID of the page in the presentation
  # @return {string}                the key for the width of a page image
  getPageWidthString: (meetingID, presentationID, pageID) ->
    "meeting-#{meetingID}-presentation-#{presentationID}-page-#{pageID}-width"

  # Get the key for the height of a page image
  # @param  {string} meetingID      the ID of the meeting
  # @param  {string} presentationID the unique ID of the presentation in the meeting
  # @param  {string} pageID         the unique ID of the page in the presentation
  # @return {string}                the key for the height of a page image
  getPageHeightString: (meetingID, presentationID, pageID) ->
    "meeting-#{meetingID}-presentation-#{presentationID}-page-#{pageID}-height"



  # Set the public and session ID to match one another for lookup later
  # @param {string}   meetingID the ID of the meeting
  # @param {string}   sessionID the sessionID (unique ID) of the user
  # @param {string}   publicID  the unique public ID of the user
  # @param {Function} callback  callback function
  setIDs: (meetingID, sessionID, publicID, callback) ->
    config.store.set @getSessionIDString(meetingID, sessionID), publicID, (err, reply) =>
      registerError("setIDs", err)
      config.store.set @getPublicIDString(meetingID, publicID), sessionID, (err, reply) ->
        registerError("setIDs", err)
        callback?()

  # Set the presenter from the public ID only.
  # @param {string}   meetingID the ID of the meeting
  # @param {string}   publicID  the unique public ID of the user
  # @param {Function} callback  callback function
  setPresenterFromPublicID: (meetingID, publicID, callback) ->
    @_getSessionIDFromPublicID meetingID, publicID, (sessionID) =>
      @setPresenter meetingID, sessionID, publicID, (success) ->
        if success
          console.log "set presenter to", sessionID
          callback?(true)
        else
          console.log "could not set presenter to", sessionID
          callback?(false)

  # Set the current tool no redis.
  # @param {string}   meetingID the ID of the meeting
  # @param {string}   publicID  the unique public ID of the user
  # @param {Function} callback(success)  callback function
  setCurrentTool: (meetingID, tool, callback) ->
    config.store.set @getCurrentToolString(meetingID), tool, (err, reply) ->
      if reply
        callback?(true)
      else
        registerError("setCurrentTool", err) if err?
        callback?(false)

  # Set the presenter on redis.
  # @param {string}   meetingID the ID of the meeting
  # @param {string}   sessionID the sessionID (unique ID) of the user
  # @param {string}   publicID  the unique public ID of the user
  # @param {Function} callback(publicID)  callback function
  # TODO: returns publicID or false, doesn't make much sense, review
  setPresenter: (meetingID, sessionID, publicID, callback) ->
    config.store.hmset @getPresenterString(meetingID), "sessionID", sessionID, "publicID", publicID, (err, reply) ->
      if reply
        callback?(publicID)
      else
        registerError("setPresenter", err) if err?
        callback?(false)

  # Get the session ID (private) of the presenter.
  # @param  {string}   meetingID the ID of the meeting
  # @param  {Function} callback(presenterID)  callback function
  getPresenterSessionID: (meetingID, callback) ->
    config.store.hget @getPresenterString(meetingID), "sessionID", (err, reply) ->
      if reply
        callback?(reply)
      else
        registerError("getPresenterSessionID", err) if err?
        callback?(null)

  # Get the public ID of the presenter.
  # @param  {string}   meetingID the ID of the meeting
  # @param  {Function} callback(publicID)  callback function
  getPresenterPublicID: (meetingID, callback) ->
    config.store.hget @getPresenterString(meetingID), "publicID", (err, reply) ->
      if reply
        callback?(reply)
      else
        registerError("getPresenterPublicID", err) if err?
        callback?(null)

  # Get the current tool of the meeting.
  # @param  {string}   meetingID the ID of the meeting
  # @param  {Function} callback(tool)  callback function
  getCurrentTool: (meetingID, callback) ->
    config.store.get @getCurrentToolString(meetingID), (err, reply) ->
      if reply
        callback?(reply)
      else
        registerError("getCurrentTool", err) if err?
        callback?(null)

  # Delete the item list
  # @param  {string}   meetingID      the ID of the meeting
  # @param  {string}   presentationID the unique ID of the presentation in the meeting
  # @param  {string}   pageID         the unique ID of the page in the presentation
  # @param  {string}   itemName       the name of the type of items being deleted
  # @param  {Function} callback       the callback function to be called when finished
  deleteItemList: (meetingID, presentationID, pageID, itemName, callback) ->

    # delete the list which contains the item ids
    config.store.del @_getItemsStringFunction(itemName)(meetingID, presentationID, pageID), (err, reply) ->
      registerSuccess("deleteItemList", "deleted the list of items: #{itemName}") if reply
      registerError("deleteItemList", err, "could not delete list of items: #{itemName}") if err?

  # Deletes the items by itemName and an array of itemIDs (use helper).
  # @param  {string} meetingID      the ID of the meeting
  # @param  {string} presentationID the unique ID of the presentation in the meeting
  # @param  {string} pageID         the unique ID of the page in the presentation
  # @param  {string} itemName       the name of the item
  # @param  {string} itemIDs        an array of itemIDs to delete
  deleteItems: (meetingID, presentationID, pageID, itemName, itemIDs) ->
    getString = @_getItemStringFunction(itemName)
    # TODO: review if the reverse loop is ok
    for i in [itemIDs.length-1..0] by -1
      item = itemIDs[i]
      config.store.del getString(meetingID, presentationID, pageID, item), (err, reply) ->
        registerSuccess("deleteItems", "delete item: #{itemName}") if reply
        registerError("deleteItems", err, "could not delete item: #{itemName}") if err?

  # Delete a meeting from redis.
  # @param  {string}   meetingID the ID of the meeting
  # @param  {Function} callback  callback function
  deleteMeeting: (meetingID, callback) ->
    config.store.srem @getMeetingsString(), meetingID, (err, reply) ->
      if reply
        registerSuccess("deleteMeeting", "deleted meeting #{meetingID} from list of meetings")
        callback?(true)
      else
        registerError("deleteMeeting", err, "meeting #{meetingID} was not in the list of meetings") if err?
        callback?(false)

  # Process of the meeting once all the users have left
  # For now, this simply deletes everything associated with the meeting from redis
  # @param  {string}              meetingID the ID of the meeting
  # TODO: it does a lot of stuff, review
  # TODO: shouldn't all methods be nested? some callbacks are being used simply for console.log
  # TODO: use for's, not while's
  processMeeting: (meetingID) ->
    config.store.del @getPresenterString(meetingID), (err, reply) ->
      console.log "deleted presenter"

    config.store.del @getCurrentViewBoxString(meetingID), (err, reply) ->
      console.log "deleted viewbox"

    config.store.del @getCurrentToolString(meetingID), (err, reply) ->
      console.log "deleted current tool"

    @deleteMeeting(meetingID) # TODO: it has a callback
    @getPresentationIDs meetingID, (presIDs) =>
      k = presIDs.length - 1

      while k >= 0
        @getPageIDs meetingID, presIDs[k], (presID, pageIDs) =>
          m = pageIDs.length - 1

          while m >= 0
            items = ["messages", "shapes"]
            j = 0
            j = items.length - 1

            while j >= 0

              # must iterate through all presentations and all pages
              @getItemIDs meetingID, presID, pageIDs[m], items[j], (meetingID, presentationID, pageID, itemIDs, itemName) =>
                @deleteItems meetingID, presentationID, pageID, itemName, itemIDs

              j--
            lists = ["currentshapes", "messages"]
            n = lists.length - 1

            while n >= 0
              @deleteItemList meetingID, presID, pageIDs[m], lists[n]
              n--
            m--

        @deletePages meetingID, presIDs[k] #delete all the pages for the associated presentation
        k--

    @deletePresentations(meetingID) # delete all the presentations

  # Get the item IDs from the item name
  # @param  {string}   meetingID      the ID of the meeting
  # aram  {string}   presentationID the unique ID of the presentation in the meeting
  # @param  {string}   pageID         the unique ID of the page in the presentation
  # @param  {string}   itemName       the name of the type of items getting the IDs of
  # @param  {Function} callback       the callback function to be called when finished
  getItemIDs: (meetingID, presentationID, pageID, itemName, callback) ->
    method = @_getItemsStringFunction(itemName)
    config.store.lrange method(meetingID, presentationID, pageID), 0, -1, (err, itemIDs) ->
      callback?(meetingID, presentationID, pageID, itemIDs, itemName)

  # Get a list of the current users of the meeting
  # @param  {string}   meetingID the ID of the meeting
  # @param  {Function} callback  callback function
  # TODO: not being used
  getCurrentUsers: (meetingID, callback) ->
    config.store.smembers @getCurrentUsersString(meetingID), (err, reply) ->
      if reply
        registerSuccess("getCurrentUsers")
        callback?(reply)
      else
        registerError("getCurrentUsers", err) if err?
        callback?(false)

  # Set the image size to a image in a page
  # @param {string}   meetingID      the ID of the meeting
  # @param {string}   presentationID the unique ID of the presentation in the meeting
  # @param {string}   pageID         the unique ID of the page in the presentation
  # @param {string|number}   width   the value of the width of the image (in pixels)
  # @param {string|number}   height  the value of the height of the image (in pixels)
  # TODO: treat possible errors
  setImageSize: (meetingID, presentationID, pageID, width, height, callback) ->
    config.store.set @getPageWidthString(meetingID, presentationID, pageID), width, (err, reply) =>
      config.store.set @getPageHeightString(meetingID, presentationID, pageID), height, (err, reply) =>
        callback?(true)

  # Get a image size from the image on the page
  # @param  {string}   meetingID      the ID of the meeting
  # @param  {string}   presentationID the unique ID of the presentation in the meeting
  # @param  {string}   pageID         the unique ID of the page in the presentation
  # @param  {Function} callback       the callback function to be called when finished
  # TODO: treat possible errors
  getImageSize: (meetingID, presentationID, pageID, callback) ->
    config.store.get @getPageWidthString(meetingID, presentationID, pageID), (err, width) =>
      config.store.get @getPageHeightString(meetingID, presentationID, pageID), (err, height) =>
        callback?(width, height)

  # Get presentation IDs for a meeting
  # @param  {string}   meetingID the ID of the meeting
  # @param  {Function} callback  callback function
  # TODO: treat possible errors
  getPresentationIDs: (meetingID, callback) ->
    config.store.smembers @getPresentationsString(meetingID), (err, presIDs) ->
      callback?(presIDs)

  # Get the page IDs for a presentation
  # @param  {string}   meetingID      the ID of the meeting
  # @param  {string}   presentationID the unique ID of the presentation in the meeting
  # @param  {Function} callback       the callback function to be called when finished
  # TODO: treat possible errors
  getPageIDs: (meetingID, presentationID, callback) ->
    config.store.lrange @getPagesString(meetingID, presentationID), 0, -1, (err, pageIDs) ->
      callback?(presentationID, pageIDs)

  # Checks the redis datastore whether the session is valid
  # @param  {string}   meetingID the ID of the meeting
  # @param  {string}   sessionID the sessionID (unique ID) of the user
  # @param  {Function} callback  callback function returns true if valid session
  # TODO: treat possible errors
  isValidSession: (meetingID, sessionID, callback) ->
    config.store.sismember @getUsersString(meetingID), sessionID, (err, isValid) ->
      callback?(isValid)

  # Checks whether the meeting is running or not (true => running)
  # @param  {string}   meetingID the ID of the meeting
  # @param  {Function} callback  callback function returns true if meeting is running
  # TODO: treat possible errors
  isMeetingRunning: (meetingID, callback) ->
    config.store.sismember @getMeetingsString(), meetingID, (err, reply) ->
      if reply is 1
        callback?(true)
      else
        callback?(false)

  # Delete all page references from a presentation.
  # @param  {string}   meetingID      the ID of the meeting
  # @param  {string}   presentationID the unique ID of the presentation in the meeting
  # @param  {Function} callback       the callback function to be called when finished
  # TODO: treat possible errors
  # TODO: use for's, not while's
  deletePages: (meetingID, presentationID, callback) ->

    # delete each page image
    @getPageIDs meetingID, presentationID, (presentationID, pageIDs) ->
      i = pageIDs.length - 1

      while i >= 0
        @deletePageImage meetingID, presentationID, pageIDs[i]
        i--

      # delete list of pages
      config.store.del @getPagesString(meetingID, presentationID), (err, reply) ->
        registerError("deletePages", err, "couldn't delete all pages") if err?
        registerSuccess("deletePages", "deleted all pages") if reply

        # delete currentpage
        config.store.del @getCurrentPageString(meetingID, presentationID), (err, reply) ->
          registerError("deletePages", err, "couldn't delete current pages") if err?
          registerSuccess("deletePages", "deleted the current pages") if reply
          callback?()

  # Delete the reference to the image from a particular presentation page in a meeting
  # @param  {string}   meetingID      the ID of the meeting
  # @param  {string}   presentationID the unique ID of the presentation in the meeting
  # @param  {string}   pageID         the unique ID of the page in the presentation
  # @param  {Function} callback       the callback function to be called when finished
  deletePageImage: (meetingID, presentationID, pageID, callback) ->
    config.store.del @getPageImageString(meetingID, presentationID, pageID), (err, reply) ->
      registerError("deletePageImage", err, "couldn't delete page image") if err?
      registerSuccess("deletePageImage", "deleted page image") if reply
      callback?()

  # Delete all presentation references from the meeting
  # @param  {string}   meetingID the ID of the meeting
  # @param  {Function} callback  callback function
  deletePresentations: (meetingID, callback) ->
    config.store.del @getPresentationsString(meetingID), (err, reply) =>
      registerSuccess("deletePresentations", "deleted all presentations") if reply
      registerError("deletePresentations", err, "couldn't delete all presentations") if err?
      config.store.del @getCurrentPresentationString(meetingID), (err, reply) ->
        registerSuccess("deletePresentations", "deleted current presentation") if reply
        registerError("deletePresentations", err, "couldn't delete current presentations") ir err?
        callback?()

  # Delete the user from redis
  # @param  {string}   meetingID the ID of the meeting
  # @param  {string}   sessionID the sessionID (unique ID) of the user
  # @param  {Function} callback  callback function
  # TODO: treat possible errors
  deleteUser: (meetingID, sessionID, callback) ->
    config.store.srem @getUsersString(meetingID), sessionID, (err, num_deleted) =>
      config.store.del @getUserString(meetingID, sessionID), (err, reply) =>
        callback?(true)

  # Remove the current user from the list of current user
  # @param  {string}   meetingID the ID of the meeting
  # @param  {string}   sessionID the sessionID (unique ID) of the user
  # @param  {Function} callback  callback function
  # TODO: treat possible errors
  # TODO: not being used
  deleteCurrentUser: (meetingID, sessionID, callback) ->
    config.store.srem @getCurrentUsersString(meetingID), sessionID, (err, num_deleted) ->
      callback?(true)

  # Gets all the properties associated with a specific user (sessionID)
  # @param  {string}   meetingID the ID of the meeting
  # @param  {string}   sessionID the sessionID (unique ID) of the user
  # @param  {Function} callback  callback function
  # TODO: treat possible errors
  getUserProperties: (meetingID, sessionID, callback) ->
    config.store.hgetall @getUserString(meetingID, sessionID), (err, properties) ->
      callback?(properties)

  # Gets a single property from a specific user
  # @param  {string}   meetingID the ID of the meeting
  # @param  {string}   sessionID the sessionID (unique ID) of the user
  # @param  {string}   property  the name of the property from the users list of properties to get
  # @param  {Function} callback  callback function
  # TODO: treat possible errors
  # TODO: not being used
  getUserProperty: (meetingID, sessionID, property, callback) ->
    config.store.hget @getUserString(meetingID, sessionID), property, (err, prop) ->
      if prop?
        registerSuccess("getUserProperty")
        callback?(prop)
      else
        registerError("getUserProperty", err) ir err?
        callback?(null)

  # Get all users and their data in an array (users are originally in a set, not a list, because they
  # need to be accessed with O(1))
  # @param  {string}   meetingID the ID of the meeting
  # @param  {Function} callback  callback function
  # TODO: treat possible errors
  # TODO: use for's, not while's
  # TODO: callback is not always called
  getUsers: (meetingID, callback) ->
    users = []
    usercount = 0
    usersdone = 0
    config.store.smembers @getUsersString(meetingID), (err, userids) =>
      usercount = userids.length
      i = usercount - 1

      while i >= 0
        config.store.hgetall @getUserString(meetingID, userids[i]), (err, props) =>
          users.push props
          usersdone++
          if usercount is usersdone
            callback?(users)

        i--

  # Get the page image filename
  # @param  {string}   meetingID      the ID of the meeting
  # @param  {string}   presentationID the unique ID of the presentation in the meeting
  # @param  {string}   pageID         the unique ID of the page in the presentation
  # aram  {Function} callback       the callback function to be called when finished
  getPageImage: (meetingID, presentationID, pageID, callback) ->
    config.store.get @getPageImageString(meetingID, presentationID, pageID), (err, filename) ->
      if filename
        registerSuccess("getPageImage")
        callback?(pageID, filename)
      else
        registerError("getPageImage", err) ir err?
        callback?(null)

  # Get array of items by item name and meeting id
  # @param  {string}   meetingID      the ID of the meeting
  # @param  {string}   presentationID the unique ID of the presentation in the meeting
  # @param  {string}   pageID         the unique ID of the page in the presentation
  # @param  {string}   item           the name of the type of item
  # @param  {Function} callback       the callback function to be called when finished
  # TODO: treat possible errors
  # TODO: use for's, not while's
  # TODO: callback is not always called
  getItems: (meetingID, presentationID, pageID, item, callback) ->
    items = []
    itemCount = 0
    itemsDone = 0
    itemsGetFunction = undefined
    itemGetFunction = undefined
    itemGetFunction = @_getItemStringFunction(item)
    itemsGetFunction = @_getItemsStringFunction(item)
    config.store.lrange itemsGetFunction(meetingID, presentationID, pageID), 0, -1, (err, itemIDs) ->
      itemCount = itemIDs.length
      callback?([]) if itemCount is 0
      i = itemCount - 1

      while i >= 0
        config.store.hgetall itemGetFunction(meetingID, presentationID, pageID, itemIDs[i]), (err, itemHash) ->
          items.push itemHash
          itemsDone++
          if itemCount is itemsDone
            callback?(items)

        i--

  # Get the current presentation ID for the meeting
  # @param  {string}   meetingID the ID of the meeting
  # @param  {Function} callback  callback function
  getCurrentPresentationID: (meetingID, callback) ->
    config.store.get @getCurrentPresentationString(meetingID), (err, currPresID) ->
      if currPresID
        registerSuccess("getCurrentPresentationID")
        callback?(currPresID)
      else
        registerError("getCurrentPresentationID", err) ir err?
        callback?(null)

  # Change to the next page in the presentation
  # @param  {string}   meetingID      the ID of the meeting
  # @param  {string}   presentationID the unique ID of the presentation in the meeting
  # @param  {Function} callback       the callback function to be called when finished
  changeToNextPage: (meetingID, presentationID, callback) ->
    pages = @getPagesString(meetingID, presentationID)
    config.store.lpop pages, (err, reply) ->
      config.store.rpush pages, reply, (err, reply) ->
        config.store.lindex pages, 0, (err, currPage) ->
          if currPage
            registerSuccess("changeToNextPage")
            callback?(currPage)
          else
            registerError("changeToNextPage", err) ir err?
            callback?(null)

  # Change to the previous page in the presentation
  # @param  {string}   meetingID      the ID of the meeting
  # @param  {string}   presentationID the unique ID of the presentation in the meeting
  # @param  {Function} callback       the callback function to be called when finished
  changeToPrevPage: (meetingID, presentationID, callback) ->
    pages = @getPagesString(meetingID, presentationID)

    # removes the last element and then returns it, only after appending it back
    # to the beginning of the same list
    config.store.rpoplpush pages, pages, (err, currPage) ->
      if currPage
        registerSuccess("changeToPrevPage")
        callback?(currPage)
      else
        registerError("changeToPrevPage", err) ir err?
        callback?(null)

  # Get the current page of the presentation
  # @param  {string}   meetingID      the ID of the meeting
  # @param  {string}   presentationID the unique ID of the presentation in the meeting
  # @param  {Function} callback       the callback function to be called when finished
  getCurrentPageID: (meetingID, presentationID, callback) ->

    # the first element in the pages is always the current page
    config.store.lindex @getPagesString(meetingID, presentationID), 0, (err, currPgID) ->
      if currPgID
        registerSuccess("getCurrentPageID")
        callback?(currPgID)
      else
        registerError("getCurrentPageID", err) ir err?
        callback?(null)

  # Create a new presentation for a meeting, and possibly set it as the current meeting
  # @param  {string}   meetingID  the ID of the meeting
  # @param  {boolean}  setCurrent set current presentation after creation (true or false)
  # @param  {Function} callback   the callback function to be called when finished
  createPresentation: (meetingID, setCurrent, callback) ->
    presentationID = rack() # create a new unique presentationID
    config.store.sadd @getPresentationsString(meetingID), presentationID, (err, reply) =>
      if reply
        registerSuccess("createPresentation", "added presentationID #{presentationID} to set of presentations.")
        if setCurrent
          @setCurrentPresentation meetingID, presentationID, ->
            callback?(presentationID)
        else
          callback?(presentationID)
      else
        registerError("createPresentation", err, "couldn't add presentationID #{presentationID} to set of presentations") ir err?
        callback?(null)

  # Set the current page of the presentation
  # @param {string}   meetingID      the ID of the meeting
  # @param {string}   presentationID the unique ID of the presentation in the meeting
  # @param {string}   pageID         the unique ID of the page in the presentation
  # TODO: not being used
  setCurrentPage: (meetingID, presentationID, pageID, callback) ->
    config.store.set @getCurrentPageString(meetingID, presentationID), pageID, (err, reply) ->
      registerSuccess("setCurrentPage", "set current pageID to #{pageID}") if reply
      registerError("setCurrentPage", err, "couldn't set current pageID to #{pageID}") ir err?
      callback?()

  # Create a page for a presentation in a meeting
  # @param  {string}   meetingID      the ID of the meeting
  # @param  {string}   presentationID the unique ID of the presentation in the meeting
  # @param  {string}   imageName      the file name of the image
  # @param  {boolean}  setCurrent     set as current page after creating the page (true or false)
  # @param  {Function} callback       the callback function to be called when finished
  createPage: (meetingID, presentationID, imageName, setCurrent, callback) ->
    pageID = rack() # create a new unique pageID
    afterPush = (err, reply) =>
      if reply
        registerSuccess("createPage", "created page with ID #{pageID}")
        @_setPageImage meetingID, presentationID, pageID, imageName, ->
          callback?(pageID, imageName)
      else
        registerError("createPage", err, "couldn't create page with ID #{pageID}") ir err?
        callback?(null)

    if setCurrent
      config.store.lpush @getPagesString(meetingID, presentationID), pageID, afterPush
    else
      config.store.rpush @getPagesString(meetingID, presentationID), pageID, afterPush

  # Set the current presentation
  # @param {string}   meetingID      the ID of the meeting
  # @param {string}   presentationID the unique ID of the presentation in the meeting
  setCurrentPresentation: (meetingID, presentationID, callback) ->
    config.store.set @getCurrentPresentationString(meetingID), presentationID, (err, reply) ->
      registerSuccess("setCurrentPresentation", "set current presentationID to #{presentationID}") if reply
      registerError("setCurrentPresentation", err, "couldn't set current presentationID to #{presentationID}") ir err?
      callback?()

  # Set the value of the current viewbox for the meeting
  # @param {string}   meetingID the ID of the meeting
  # @param {string}   viewbox   the string representing the viewbox value
  setViewBox: (meetingID, viewbox, callback) ->
    config.store.set @getCurrentViewBoxString(meetingID), viewbox, (err, reply) ->
      if reply
        registerSuccess("setViewBox")
        callback?(true)
      else
        registerError("setViewBox", err) ir err?
        callback?(false)

  # Get the current viewbox of the meeting
  # @param  {string}   meetingID the ID of the meeting
  # @param  {Function} callback  callback function
  getViewBox: (meetingID, callback) ->
    config.store.get @getCurrentViewBoxString(meetingID), (err, reply) ->
      if reply
        registerSuccess("getViewBox")
        callback?(reply)
      else
        registerError("getViewBox", err) ir err?
        callback?(false)

  # Create a reference to a meeting
  # @param  {string}   meetingID the ID of the meeting
  # @param  {Function} callback  callback function
  createMeeting: (meetingID, callback) ->
    # TODO: no callback on sadd?
    config.store.sadd @getMeetingsString(), meetingID # create the meeting if not already created.
    callback?()

  # Create a reference to a user
  # @param  {string}   meetingID the ID of the meeting
  # @param  {string}   userID    the unique session ID of the user
  # @param  {Function} callback  callback function
  createUser: (meetingID, userID, callback) ->
    # TODO: no callback on sadd?
    config.store.sadd @getUsersString(meetingID), userID # meeting-123-users.push(sessionID)
    callback?()

  # Update user properties
  # @param  {string}   meetingID  the ID of the meeting
  # @param  {string}   userID     the unique session ID of the user
  # @param  {Object}   properties a hash of properties to set as the users properties
  # @param  {Function} callback   the callback function to be called when finished
  updateUserProperties: (meetingID, userID, properties, callback) ->
    properties.unshift @getUserString(meetingID, userID)
    properties.push (err, reply) ->
      if reply
        registerSuccess("updateUserProperties")
        callback?(reply)
      else
        registerError("updateUserProperties", err) ir err?
        callback?(false)

    # TODO: no callback on the call below?
    config.store.hmset.apply config.store, properties

  getMeetings: (callback) ->
    config.store.smembers "meetings", (err, meetingids) ->
      if meetingids
        registerSuccess("getMeetings")
        index = 0
        resp = []
        f = (err, properties) ->
          if index is meetingids.length
            callback?(resp)
          else
            r = {}
            r.meetingID = meetingids[index]
            r.externalID = properties["externalID"]
            r.meetingName = properties["name"]
            resp.push r
            index += 1
            config.store.hgetall "meeting-" + meetingids[index], f

        config.store.hgetall "meeting-" + meetingids[index], f
      else
        registerError("getMeetings", err) ir err?
        callback?([])


  #
  # # Private methods
  #


  # Returns the function for getting the string of a specific item given the name of
  # the item type in redis.
  # @param  {string}    itemString the name of the item
  # @return {Function}  the function used to get the key for a specific item from redis
  _getItemStringFunction: (itemString) ->
    functions =
      messages: @getMessageString
      shapes: @getShapeString
      currentshapes: @getShapeString
    functions[itemString]

  # Returns the function for getting the string of all the items given the name of the items
  # in redis
  # @param  {string}    itemString the name of the item
  # @return {Function}  the function used to get the key for the list of specific items in redis
  _getItemsStringFunction: (itemString) ->
    functions =
      messages: @getMessagesString
      shapes: @getCurrentShapesString
      currentshapes: @getCurrentShapesString
    functions[itemString]

  # Get the session ID from the public ID of a user
  # @param  {string}   meetingID the ID of the meeting
  # @param  {string}   publicID  the unique public ID of the user
  # @param  {Function} callback  callback function
  _getSessionIDFromPublicID: (meetingID, publicID, callback) ->
    config.store.get @getPublicIDString(meetingID, publicID), (err, sessionID) ->
      registerError("_getSessionIDFromPublicID", err)
      callback?(sessionID)

  # Get the public ID from the session ID of a user
  # @param  {string}   meetingID the ID of the meeting
  # @param  {string}   sessionID the sessionID (unique ID) of the user
  # @param  {Function} callback  callback function
  # TODO: not being used
  _getPublicIDFromSessionID: (meetingID, sessionID, callback) ->
    config.store.get @getSessionIDString(meetingID, sessionID), (err, publicID) ->
      callback?(publicID)

  # Set the image for a particular page ID
  # @param {string}   meetingID      the ID of the meeting
  # @param {string}   presentationID the unique ID of the presentation in the meeting
  # @param {string}   pageID         the unique ID of the page in the presentation
  # @param {string}   imageName      the file name of the image
  _setPageImage: (meetingID, presentationID, pageID, imageName, callback) ->
    config.store.set @getPageImageString(meetingID, presentationID, pageID), imageName, (err, reply) ->
      registerSuccess("_setPageImage", "set page #{pageID} image to #{imageName}") if reply
      registerError("_setPageImage", err, "couldn't set page #{pageID} image to #{imageName}") if err?
      callback?()


#
# # Local methods
#

registerError = (method, err, message="") ->
  console.log "error on RedisAction##{method}:", message, err

registerSuccess = (method, message="") ->
  console.log "success on RedisAction##{method}:", message
