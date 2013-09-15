rack = require("hat").rack()

config = require("../config")
RedisKeys = require("./redis_keys")

moduleDeps = ["RedisStore"]

# TODO: some callbacks are not always called
# TODO: use standard success/error responses (e.g. sometimes failure returns `null`, sometimes `false`)
module.exports = class RedisAction

  constructor: ->
    config.modules.wait moduleDeps, =>
      @redisStore = config.modules.get("RedisStore")

  # Set the public and session ID to match one another for lookup later
  # @param {string}   meetingID the ID of the meeting
  # @param {string}   sessionID the sessionID (unique ID) of the user
  # @param {string}   publicID  the unique public ID of the user
  # @param {Function} callback  callback function
  setIDs: (meetingID, sessionID, publicID, callback) ->
    @redisStore.set RedisKeys.getSessionIDString(meetingID, sessionID), publicID, (err, reply) =>
      registerError("setIDs", err)
      @redisStore.set RedisKeys.getPublicIDString(meetingID, publicID), sessionID, (err, reply) ->
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
    @redisStore.set RedisKeys.getCurrentToolString(meetingID), tool, (err, reply) ->
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
    @redisStore.hmset RedisKeys.getPresenterString(meetingID), "sessionID", sessionID, "publicID", publicID, (err, reply) ->
      if reply
        callback?(publicID)
      else
        registerError("setPresenter", err) if err?
        callback?(false)

  # Get the session ID (private) of the presenter.
  # @param  {string}   meetingID the ID of the meeting
  # @param  {Function} callback(presenterID)  callback function
  getPresenterSessionID: (meetingID, callback) ->
    @redisStore.hget RedisKeys.getPresenterString(meetingID), "sessionID", (err, reply) ->
      if reply
        callback?(reply)
      else
        registerError("getPresenterSessionID", err) if err?
        callback?(null)

  # Get the public ID of the presenter.
  # @param  {string}   meetingID the ID of the meeting
  # @param  {Function} callback(publicID)  callback function
  getPresenterPublicID: (meetingID, callback) ->
    @redisStore.hget RedisKeys.getPresenterString(meetingID), "publicID", (err, reply) ->
      if reply
        callback?(reply)
      else
        registerError("getPresenterPublicID", err) if err?
        callback?(null)

  # Get the current tool of the meeting.
  # @param  {string}   meetingID the ID of the meeting
  # @param  {Function} callback(tool)  callback function
  getCurrentTool: (meetingID, callback) ->
    @redisStore.get RedisKeys.getCurrentToolString(meetingID), (err, reply) ->
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
    @redisStore.del @_getItemsStringFunction(itemName)(meetingID, presentationID, pageID), (err, reply) ->
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
      @redisStore.del getString(meetingID, presentationID, pageID, item), (err, reply) ->
        registerSuccess("deleteItems", "delete item: #{itemName}") if reply
        registerError("deleteItems", err, "could not delete item: #{itemName}") if err?

  # Delete a meeting from redis.
  # @param  {string}   meetingID the ID of the meeting
  # @param  {Function} callback  callback function
  deleteMeeting: (meetingID, callback) ->
    @redisStore.srem RedisKeys.getMeetingsString(), meetingID, (err, reply) ->
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
    @redisStore.del RedisKeys.getPresenterString(meetingID), (err, reply) ->
      console.log "deleted presenter"

    @redisStore.del RedisKeys.getCurrentViewBoxString(meetingID), (err, reply) ->
      console.log "deleted viewbox"

    @redisStore.del RedisKeys.getCurrentToolString(meetingID), (err, reply) ->
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
    @redisStore.lrange method(meetingID, presentationID, pageID), 0, -1, (err, itemIDs) ->
      callback?(meetingID, presentationID, pageID, itemIDs, itemName)

  # Get a list of the current users of the meeting
  # @param  {string}   meetingID the ID of the meeting
  # @param  {Function} callback  callback function
  # TODO: not being used
  getCurrentUsers: (meetingID, callback) ->
    @redisStore.smembers RedisKeys.getCurrentUsersString(meetingID), (err, reply) ->
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
    @redisStore.set RedisKeys.getPageWidthString(meetingID, presentationID, pageID), width, (err, reply) =>
      @redisStore.set RedisKeys.getPageHeightString(meetingID, presentationID, pageID), height, (err, reply) =>
        callback?(true)

  # Get a image size from the image on the page
  # @param  {string}   meetingID      the ID of the meeting
  # @param  {string}   presentationID the unique ID of the presentation in the meeting
  # @param  {string}   pageID         the unique ID of the page in the presentation
  # @param  {Function} callback       the callback function to be called when finished
  # TODO: treat possible errors
  getImageSize: (meetingID, presentationID, pageID, callback) ->
    @redisStore.get RedisKeys.getPageWidthString(meetingID, presentationID, pageID), (err, width) =>
      @redisStore.get RedisKeys.getPageHeightString(meetingID, presentationID, pageID), (err, height) =>
        callback?(width, height)

  # Get presentation IDs for a meeting
  # @param  {string}   meetingID the ID of the meeting
  # @param  {Function} callback  callback function
  # TODO: treat possible errors
  getPresentationIDs: (meetingID, callback) ->
    @redisStore.smembers RedisKeys.getPresentationsString(meetingID), (err, presIDs) ->
      callback?(presIDs)

  # Get the page IDs for a presentation
  # @param  {string}   meetingID      the ID of the meeting
  # @param  {string}   presentationID the unique ID of the presentation in the meeting
  # @param  {Function} callback       the callback function to be called when finished
  # TODO: treat possible errors
  getPageIDs: (meetingID, presentationID, callback) ->
    @redisStore.lrange RedisKeys.getPagesString(meetingID, presentationID), 0, -1, (err, pageIDs) ->
      callback?(presentationID, pageIDs)

  # Checks the redis datastore whether the session is valid
  # @param  {string}   meetingID the ID of the meeting
  # @param  {string}   sessionID the sessionID (unique ID) of the user
  # @param  {Function} callback  callback function returns true if valid session
  # TODO: treat possible errors
  isValidSession: (meetingID, sessionID, callback) ->
    @redisStore.sismember RedisKeys.getUsersString(meetingID), sessionID, (err, isValid) ->
      callback?(isValid)

  # Checks whether the meeting is running or not (true => running)
  # @param  {string}   meetingID the ID of the meeting
  # @param  {Function} callback  callback function returns true if meeting is running
  # TODO: treat possible errors
  isMeetingRunning: (meetingID, callback) ->
    @redisStore.sismember RedisKeys.getMeetingsString(), meetingID, (err, reply) ->
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
    @getPageIDs meetingID, presentationID, (presentationID, pageIDs) =>
      i = pageIDs.length - 1

      while i >= 0
        @deletePageImage meetingID, presentationID, pageIDs[i]
        i--

      # delete list of pages
      @redisStore.del RedisKeys.getPagesString(meetingID, presentationID), (err, reply) =>
        registerError("deletePages", err, "couldn't delete all pages") if err?
        registerSuccess("deletePages", "deleted all pages") if reply

        # delete currentpage
        @redisStore.del RedisKeys.getCurrentPageString(meetingID, presentationID), (err, reply) ->
          registerError("deletePages", err, "couldn't delete current pages") if err?
          registerSuccess("deletePages", "deleted the current pages") if reply
          callback?()

  # Delete the reference to the image from a particular presentation page in a meeting
  # @param  {string}   meetingID      the ID of the meeting
  # @param  {string}   presentationID the unique ID of the presentation in the meeting
  # @param  {string}   pageID         the unique ID of the page in the presentation
  # @param  {Function} callback       the callback function to be called when finished
  deletePageImage: (meetingID, presentationID, pageID, callback) ->
    @redisStore.del RedisKeys.getPageImageString(meetingID, presentationID, pageID), (err, reply) ->
      registerError("deletePageImage", err, "couldn't delete page image") if err?
      registerSuccess("deletePageImage", "deleted page image") if reply
      callback?()

  # Delete all presentation references from the meeting
  # @param  {string}   meetingID the ID of the meeting
  # @param  {Function} callback  callback function
  deletePresentations: (meetingID, callback) ->
    @redisStore.del RedisKeys.getPresentationsString(meetingID), (err, reply) =>
      registerSuccess("deletePresentations", "deleted all presentations") if reply
      registerError("deletePresentations", err, "couldn't delete all presentations") if err?
      @redisStore.del RedisKeys.getCurrentPresentationString(meetingID), (err, reply) ->
        registerSuccess("deletePresentations", "deleted current presentation") if reply
        registerError("deletePresentations", err, "couldn't delete current presentations") if err?
        callback?()

  # Delete the user from redis
  # @param  {string}   meetingID the ID of the meeting
  # @param  {string}   sessionID the sessionID (unique ID) of the user
  # @param  {Function} callback  callback function
  # TODO: treat possible errors
  deleteUser: (meetingID, sessionID, callback) ->
    @redisStore.srem RedisKeys.getUsersString(meetingID), sessionID, (err, num_deleted) =>
      @redisStore.del RedisKeys.getUserString(meetingID, sessionID), (err, reply) =>
        callback?(true)

  # Remove the current user from the list of current user
  # @param  {string}   meetingID the ID of the meeting
  # @param  {string}   sessionID the sessionID (unique ID) of the user
  # @param  {Function} callback  callback function
  # TODO: treat possible errors
  # TODO: not being used
  deleteCurrentUser: (meetingID, sessionID, callback) ->
    @redisStore.srem RedisKeys.getCurrentUsersString(meetingID), sessionID, (err, num_deleted) ->
      callback?(true)

  # Gets all the properties associated with a specific user (sessionID)
  # @param  {string}   meetingID the ID of the meeting
  # @param  {string}   sessionID the sessionID (unique ID) of the user
  # @param  {Function} callback  callback function
  # TODO: treat possible errors
  getUserProperties: (meetingID, sessionID, callback) ->
    @redisStore.hgetall RedisKeys.getUserString(meetingID, sessionID), (err, properties) ->
      callback?(properties)

  # Gets a single property from a specific user
  # @param  {string}   meetingID the ID of the meeting
  # @param  {string}   sessionID the sessionID (unique ID) of the user
  # @param  {string}   property  the name of the property from the users list of properties to get
  # @param  {Function} callback  callback function
  # TODO: treat possible errors
  # TODO: not being used
  getUserProperty: (meetingID, sessionID, property, callback) ->
    @redisStore.hget RedisKeys.getUserString(meetingID, sessionID), property, (err, prop) ->
      if prop?
        registerSuccess("getUserProperty")
        callback?(prop)
      else
        registerError("getUserProperty", err) if err?
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
    @redisStore.smembers RedisKeys.getUsersString(meetingID), (err, userids) =>
      usercount = userids.length
      i = usercount - 1

      while i >= 0
        @redisStore.hgetall RedisKeys.getUserString(meetingID, userids[i]), (err, props) =>
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
    @redisStore.get RedisKeys.getPageImageString(meetingID, presentationID, pageID), (err, filename) ->
      if filename
        registerSuccess("getPageImage")
        callback?(pageID, filename)
      else
        registerError("getPageImage", err) if err?
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
    @redisStore.lrange itemsGetFunction(meetingID, presentationID, pageID), 0, -1, (err, itemIDs) =>
      itemCount = itemIDs.length
      callback?([]) if itemCount is 0
      i = itemCount - 1

      while i >= 0
        @redisStore.hgetall itemGetFunction(meetingID, presentationID, pageID, itemIDs[i]), (err, itemHash) ->
          items.push itemHash
          itemsDone++
          if itemCount is itemsDone
            callback?(items)

        i--

  # Get the current presentation ID for the meeting
  # @param  {string}   meetingID the ID of the meeting
  # @param  {Function} callback  callback function
  getCurrentPresentationID: (meetingID, callback) ->
    @redisStore.get RedisKeys.getCurrentPresentationString(meetingID), (err, currPresID) ->
      if currPresID
        registerSuccess("getCurrentPresentationID")
        callback?(currPresID)
      else
        registerError("getCurrentPresentationID", err) if err?
        callback?(null)

  # Change to the next page in the presentation
  # @param  {string}   meetingID      the ID of the meeting
  # @param  {string}   presentationID the unique ID of the presentation in the meeting
  # @param  {Function} callback       the callback function to be called when finished
  changeToNextPage: (meetingID, presentationID, callback) ->
    pages = RedisKeys.getPagesString(meetingID, presentationID)
    @redisStore.lpop pages, (err, reply) =>
      @redisStore.rpush pages, reply, (err, reply) =>
        @redisStore.lindex pages, 0, (err, currPage) ->
          if currPage
            registerSuccess("changeToNextPage")
            callback?(currPage)
          else
            registerError("changeToNextPage", err) if err?
            callback?(null)

  # Change to the previous page in the presentation
  # @param  {string}   meetingID      the ID of the meeting
  # @param  {string}   presentationID the unique ID of the presentation in the meeting
  # @param  {Function} callback       the callback function to be called when finished
  changeToPrevPage: (meetingID, presentationID, callback) ->
    pages = RedisKeys.getPagesString(meetingID, presentationID)

    # removes the last element and then returns it, only after appending it back
    # to the beginning of the same list
    @redisStore.rpoplpush pages, pages, (err, currPage) ->
      if currPage
        registerSuccess("changeToPrevPage")
        callback?(currPage)
      else
        registerError("changeToPrevPage", err) if err?
        callback?(null)

  # Get the current page of the presentation
  # @param  {string}   meetingID      the ID of the meeting
  # @param  {string}   presentationID the unique ID of the presentation in the meeting
  # @param  {Function} callback       the callback function to be called when finished
  getCurrentPageID: (meetingID, presentationID, callback) ->

    # the first element in the pages is always the current page
    @redisStore.lindex RedisKeys.getPagesString(meetingID, presentationID), 0, (err, currPgID) ->
      if currPgID
        registerSuccess("getCurrentPageID")
        callback?(currPgID)
      else
        registerError("getCurrentPageID", err) if err?
        callback?(null)

  # Create a new presentation for a meeting, and possibly set it as the current meeting
  # @param  {string}   meetingID  the ID of the meeting
  # @param  {boolean}  setCurrent set current presentation after creation (true or false)
  # @param  {Function} callback   the callback function to be called when finished
  createPresentation: (meetingID, setCurrent, callback) ->
    presentationID = rack() # create a new unique presentationID
    @redisStore.sadd RedisKeys.getPresentationsString(meetingID), presentationID, (err, reply) =>
      if reply
        registerSuccess("createPresentation", "added presentationID #{presentationID} to set of presentations.")
        if setCurrent
          @setCurrentPresentation meetingID, presentationID, ->
            callback?(presentationID)
        else
          callback?(presentationID)
      else
        registerError("createPresentation", err, "couldn't add presentationID #{presentationID} to set of presentations") if err?
        callback?(null)

  # Set the current page of the presentation
  # @param {string}   meetingID      the ID of the meeting
  # @param {string}   presentationID the unique ID of the presentation in the meeting
  # @param {string}   pageID         the unique ID of the page in the presentation
  # TODO: not being used
  setCurrentPage: (meetingID, presentationID, pageID, callback) ->
    @redisStore.set RedisKeys.getCurrentPageString(meetingID, presentationID), pageID, (err, reply) ->
      registerSuccess("setCurrentPage", "set current pageID to #{pageID}") if reply
      registerError("setCurrentPage", err, "couldn't set current pageID to #{pageID}") if err?
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
        registerError("createPage", err, "couldn't create page with ID #{pageID}") if err?
        callback?(null)

    if setCurrent
      @redisStore.lpush RedisKeys.getPagesString(meetingID, presentationID), pageID, afterPush
    else
      @redisStore.rpush RedisKeys.getPagesString(meetingID, presentationID), pageID, afterPush

  # Set the current presentation
  # @param {string}   meetingID      the ID of the meeting
  # @param {string}   presentationID the unique ID of the presentation in the meeting
  setCurrentPresentation: (meetingID, presentationID, callback) ->
    @redisStore.set RedisKeys.getCurrentPresentationString(meetingID), presentationID, (err, reply) ->
      registerSuccess("setCurrentPresentation", "set current presentationID to #{presentationID}") if reply
      registerError("setCurrentPresentation", err, "couldn't set current presentationID to #{presentationID}") if err?
      callback?()

  # Set the value of the current viewbox for the meeting
  # @param {string}   meetingID the ID of the meeting
  # @param {string}   viewbox   the string representing the viewbox value
  setViewBox: (meetingID, viewbox, callback) ->
    @redisStore.set RedisKeys.getCurrentViewBoxString(meetingID), viewbox, (err, reply) ->
      if reply
        registerSuccess("setViewBox")
        callback?(true)
      else
        registerError("setViewBox", err) if err?
        callback?(false)

  # Get the current viewbox of the meeting
  # @param  {string}   meetingID the ID of the meeting
  # @param  {Function} callback  callback function
  getViewBox: (meetingID, callback) ->
    @redisStore.get RedisKeys.getCurrentViewBoxString(meetingID), (err, reply) ->
      if reply
        registerSuccess("getViewBox")
        callback?(reply)
      else
        registerError("getViewBox", err) if err?
        callback?(false)

  # Create a reference to a meeting
  # @param  {string}   meetingID the ID of the meeting
  # @param  {Function} callback  callback function
  createMeeting: (meetingID, callback) ->
    # TODO: no callback on sadd?
    @redisStore.sadd RedisKeys.getMeetingsString(), meetingID # create the meeting if not already created.
    callback?()

  # Create a reference to a user
  # @param  {string}   meetingID the ID of the meeting
  # @param  {string}   userID    the unique session ID of the user
  # @param  {Function} callback  callback function
  createUser: (meetingID, userID, callback) ->
    # TODO: no callback on sadd?
    @redisStore.sadd RedisKeys.getUsersString(meetingID), userID # meeting-123-users.push(sessionID)
    callback?()

  # Update user properties
  # @param  {string}   meetingID  the ID of the meeting
  # @param  {string}   userID     the unique session ID of the user
  # @param  {Object}   properties a hash of properties to set as the users properties
  # @param  {Function} callback   the callback function to be called when finished
  updateUserProperties: (meetingID, userID, properties, callback) ->
    properties.unshift RedisKeys.getUserString(meetingID, userID)
    properties.push (err, reply) ->
      if reply
        registerSuccess("updateUserProperties")
        callback?(reply)
      else
        registerError("updateUserProperties", err) if err?
        callback?(false)

    # TODO: no callback on the call below?
    @redisStore.hmset.apply @redisStore, properties

  getMeetings: (callback) ->
    @redisStore.smembers "meetings", (err, meetingids) =>
      if meetingids
        registerSuccess("getMeetings")
        index = 0
        resp = []
        f = (err, properties) =>
          if index is meetingids.length
            callback?(resp)
          else
            r = {}
            r.meetingID = meetingids[index]
            r.externalID = properties["externalID"]
            r.meetingName = properties["name"]
            resp.push r
            index += 1
            @redisStore.hgetall "meeting-" + meetingids[index], f

        @redisStore.hgetall "meeting-" + meetingids[index], f
      else
        registerError("getMeetings", err) if err?
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
      messages: RedisKeys.getMessageString
      shapes: RedisKeys.getShapeString
      currentshapes: RedisKeys.getShapeString
    functions[itemString]

  # Returns the function for getting the string of all the items given the name of the items
  # in redis
  # @param  {string}    itemString the name of the item
  # @return {Function}  the function used to get the key for the list of specific items in redis
  _getItemsStringFunction: (itemString) ->
    functions =
      messages: RedisKeys.getMessagesString
      shapes: RedisKeys.getCurrentShapesString
      currentshapes: RedisKeys.getCurrentShapesString
    functions[itemString]

  # Get the session ID from the public ID of a user
  # @param  {string}   meetingID the ID of the meeting
  # @param  {string}   publicID  the unique public ID of the user
  # @param  {Function} callback  callback function
  _getSessionIDFromPublicID: (meetingID, publicID, callback) ->
    @redisStore.get RedisKeys.getPublicIDString(meetingID, publicID), (err, sessionID) ->
      registerError("_getSessionIDFromPublicID", err)
      callback?(sessionID)

  # Get the public ID from the session ID of a user
  # @param  {string}   meetingID the ID of the meeting
  # @param  {string}   sessionID the sessionID (unique ID) of the user
  # @param  {Function} callback  callback function
  # TODO: not being used
  _getPublicIDFromSessionID: (meetingID, sessionID, callback) ->
    @redisStore.get RedisKeys.getSessionIDString(meetingID, sessionID), (err, publicID) ->
      callback?(publicID)

  # Set the image for a particular page ID
  # @param {string}   meetingID      the ID of the meeting
  # @param {string}   presentationID the unique ID of the presentation in the meeting
  # @param {string}   pageID         the unique ID of the page in the presentation
  # @param {string}   imageName      the file name of the image
  _setPageImage: (meetingID, presentationID, pageID, imageName, callback) ->
    @redisStore.set RedisKeys.getPageImageString(meetingID, presentationID, pageID), imageName, (err, reply) ->
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
