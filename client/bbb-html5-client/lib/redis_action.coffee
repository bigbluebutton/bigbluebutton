_ = require("lodash")
rack = require("hat").rack()

config = require("../config")
Logger = require("./logger")
RedisKeys = require("./redis_keys")
Utils = require("./utils")

moduleDeps = ["RedisStore"]

# Includes helper methods to work with redis.
#
# All callbacks are in the format `method(error, response)`, where `response` is usually the
# response returned by the method called on redis.
module.exports = class RedisAction

  constructor: ->
    config.modules.wait moduleDeps, =>
      @redisStore = config.modules.get("RedisStore")

  # Set the public and session ID to match one another for lookup later
  #
  # @param meetingID [string] the ID of the meeting
  # @param sessionID [string] the sessionID (unique ID) of the user
  # @param publicID [string] the unique public ID of the user
  # @param callback [Function(err, reply)] callback function
  setIDs: (meetingID, sessionID, publicID, callback) ->
    @redisStore.set RedisKeys.getSessionIDString(meetingID, sessionID), publicID, (err, reply) =>
      registerResponse "setIDs", err, reply
      if err?
        callback?(err, reply)
      else
        @redisStore.set RedisKeys.getPublicIDString(meetingID, publicID), sessionID, (err, reply) ->
          callback?(err, reply)

  # Given a meetingID, sessionID and username a meeting will be created and a user with the
  # given username will be joined. The callback indicates either true or false depending on whether
  # the meeting was created successfully or not.
  #
  # @param meetingID [string] the meeting ID of the meeting we are creating and/or connecting to
  # @param sessionID [string] the session ID of the user that is connecting to the meeting
  # @param username [string] username of the users that that is connecting to the meeting
  # @param callback [Function(succeeded)] the callback function returns true if meeting successfully started and joined, false otherwise
  makeMeeting: (meetingID, sessionID, username, callback) ->
    failed = false
    publicID = new Date().getTime()

    @_isMeetingRunning meetingID, (err, isRunning) =>
      # TODO: Currently the meeting is always created in the flash client. To allow the HTML5 to create
      #   a meeting this block has to be implemented
      # unless isRunning
      #   @redisStore.sadd RedisKeys.getMeetingsString(), meetingID, (err, reply) =>
      #     @setCurrentTool meetingID, "line"
      #     @setPresenter meetingID, sessionID, publicID

      @createUser meetingID, sessionID, (err, reply) =>
        failed or= err?
        @setIDs meetingID, sessionID, publicID, (err, reply) =>
          failed or= err?
          # TODO: comment what these parameters are used for
          properties = ["username", username, "meetingID", meetingID, "refreshing", false, "sockets", 0, "pubID", publicID]
          @updateUserProperties meetingID, sessionID, properties, (err, reply) ->
            failed or= err?
            callback?(!failed)

  # Create a reference to a user on redis.
  # The user is identified by his sessionID and will be grouped inside the users key for
  # the meeting `meetingID`.
  #
  # @example Example values for the key created
  #   meeting-183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1382970693956-users qT6PfopPUcRsRbtH4T9A8o2R.y7bD/JtU6MFbBn9g1lhKAYmNkD/rzZRS5AYl7TWw/9A
  #
  # @param meetingID [string] the ID of the meeting
  # @param userID [string] the unique session ID of the user
  # @param callback [Function(err, reply)] callback function
  createUser: (meetingID, userID, callback) ->
    @redisStore.sadd RedisKeys.getUsersString(meetingID), userID, (err, reply) ->
      registerResponse "createUser", err, reply
      callback?(err, reply)

  # Set user properties on redis
  #
  # @param meetingID [string] the ID of the meeting
  # @param userID [string] the unique session ID of the user
  # @param properties [Object] a hash of properties to set as the users properties
  # @param callback [Function(err, properties)] the callback function to be called when finished
  updateUserProperties: (meetingID, userID, properties, callback) ->
    properties.unshift RedisKeys.getUserString(meetingID, userID)
    # push the callback as the last parameter in the array
    properties.push (err, reply) ->
      registerResponse "updateUserProperties", err, reply
      callback?(err, reply)
    @redisStore.hmset.apply @redisStore, properties

  # Called when the application receives an `undo` from the server.
  #
  # @param meetingID [string] the ID of the meeting the undo was called on
  # @param callback [Function(err, reply)] called when done, with the error and reply from redis
  onUndo: (meetingID, callback) ->
    @getCurrentPresentationID meetingID, (err, presentationID) =>
      @getCurrentPageID meetingID, presentationID, (err, pageID) =>
        currentShape = RedisKeys.getCurrentShapesString(meetingID, presentationID, pageID)
        @redisStore.rpop currentShape, (err, reply) =>
          callback?(err, reply)

  # Called when the application receives a `clrPaper` from the server.
  #
  # @param meetingID [string] the ID of the meeting the method was called on
  # @param callback [Function(err, reply)] called when done, with the error and reply from redis
  onClearPaper: (meetingID, callback) ->
    @getCurrentPresentationID meetingID, (err, presentationID) =>
      @getCurrentPageID meetingID, presentationID, (err, pageID) =>
        @_deleteItemList meetingID, presentationID, pageID, "currentshapes", (err, reply) ->
          callback?(err, reply)

  # Get the session ID (private) of the current presenter.
  #
  # @param meetingID [string] the ID of the meeting
  # @param callback [Function(error, presenterID)] callback function
  getPresenterSessionID: (meetingID, callback) ->
    @redisStore.hget RedisKeys.getPresenterString(meetingID), "sessionID", (err, reply) ->
      registerResponse "getPresenterSessionID", err, reply
      callback?(err, reply)

  # Get the public ID of the presenter.
  #
  # @param meetingID [string] the ID of the meeting
  # @param callback [Function(err, id)] callback function
  getPresenterPublicID: (meetingID, callback) ->
    @redisStore.hget RedisKeys.getPresenterString(meetingID), "publicID", (err, id) ->
      registerResponse "getPresenterPublicID", err, id
      callback?(err, id)

  # Get the current tool of the meeting.
  #
  # @param meetingID [string] the ID of the meeting
  # @param callback [Function(err, tool)] callback function
  getCurrentTool: (meetingID, callback) ->
    @redisStore.get RedisKeys.getCurrentToolString(meetingID), (err, reply) ->
      registerResponse "getCurrentTool", err, reply
      callback?(err, reply)

  # Get a image size from the image on the page
  #
  # @param meetingID [string] the ID of the meeting
  # @param presentationID [string] the unique ID of the presentation in the meeting
  # @param pageID [string] the unique ID of the page in the presentation
  # @param callback [Function(err, width, height)] the callback function to be called when finished
  getImageSize: (meetingID, presentationID, pageID, callback) ->
    @redisStore.get RedisKeys.getPageWidthString(meetingID, presentationID, pageID), (err, width) =>
      registerResponse "getImageSize", err, width, "getting width of #{meetingID}, #{presentationID}, #{pageID}"
      @redisStore.get RedisKeys.getPageHeightString(meetingID, presentationID, pageID), (err, height) =>
        registerResponse "getImageSize", err, height, "getting height of #{meetingID}, #{presentationID}, #{pageID}"
        callback?(err, width, height)

  # Get the page IDs for a presentation
  #
  # @param meetingID [string] the ID of the meeting
  # @param presentationID [string] the unique ID of the presentation in the meeting
  # @param callback [Function(err, ids)] the callback function to be called when finished
  getPageIDs: (meetingID, presentationID, callback) ->
    @redisStore.lrange RedisKeys.getPagesString(meetingID, presentationID), 0, -1, (err, pageIDs) ->
      registerResponse "getPageIDs", err, pageIDs, "getting page IDs for #{meetingID}, #{presentationID}"
      callback?(err, pageIDs)

  # Checks the redis datastore whether the session is valid
  #
  # @param meetingID [string] the ID of the meeting
  # @param sessionID [string] the sessionID (unique ID) of the user
  # @param callback [Function(err, isValid)] callback function returns true if valid session
  isValidSession: (meetingID, sessionID, callback) ->
    @redisStore.sismember RedisKeys.getUsersString(meetingID), sessionID, (err, isValid) ->
      registerResponse "isValidSession", err, isValid, "checking session #{meetingID}, #{sessionID}"
      callback?(err, isValid)

  # Delete the user from redis
  #
  # @param meetingID [string] the ID of the meeting
  # @param sessionID [string] the sessionID (unique ID) of the user
  # @param callback [Function(err, isValid)] callback function called when finished
  deleteUser: (meetingID, sessionID, callback) ->
    @redisStore.srem RedisKeys.getUsersString(meetingID), sessionID, (err, reply) =>
      registerResponse "deleteUser", err, reply, "deleting user #{meetingID}, #{sessionID}"
      if err?
        callback?(err, reply)
      else
        @redisStore.del RedisKeys.getUserString(meetingID, sessionID), (err, reply) =>
          registerResponse "deleteUser", err, reply, "deleting user string #{meetingID}, #{sessionID}"
          callback?(err, reply)

  # Gets all the properties associated with a specific user (sessionID)
  #
  # @param meetingID [string] the ID of the meeting
  # @param sessionID [string] the sessionID (unique ID) of the user
  # @param callback [Function(err, properties)] callback function
  getUserProperties: (meetingID, sessionID, callback) ->
    @redisStore.hgetall RedisKeys.getUserString(meetingID, sessionID), (err, properties) ->
      registerResponse "getUserProperties", err, properties, "getting user properties #{meetingID}, #{sessionID}"
      callback?(err, properties)

  # Get all users and their data in an array
  #
  # @param meetingID [string] the ID of the meeting
  # @param callback [Function(err, users)] callback function
  #
  # @todo callback is not always called, can use async for this
  getUsers: (meetingID, callback) ->
    users = []
    usercount = 0
    usersdone = 0
    @redisStore.smembers RedisKeys.getUsersString(meetingID), (err, userids) =>
      registerResponse "getUsers", err, userids, "getting users string for #{meetingID}"
      userids.forEach (userid) =>
        @redisStore.hgetall RedisKeys.getUserString(meetingID, userid), (err, props) =>
          registerResponse "getUsers", err, props, "getting user string for #{meetingID}, #{userid}"
          users.push props
          usersdone++
          if userids.length is usersdone
            callback?(err, users)

  # Get array of items by item name and meeting id
  #
  # @param meetingID [string] the ID of the meeting
  # @param presentationID [string] the unique ID of the presentation in the meeting
  # @param pageID [string] the unique ID of the page in the presentation
  # @param item [string] the name of the type of item
  # @param callback [Function(err, items)] the callback function to be called when finished
  #
  # @todo callback is not always called, can use async for this
  getItems: (meetingID, presentationID, pageID, item, callback) ->
    items = []
    itemCount = 0
    itemsDone = 0
    itemsGetFunction = undefined
    itemGetFunction = undefined
    itemGetFunction = @_getItemStringFunction(item)
    itemsGetFunction = @_getItemsStringFunction(item)
    @redisStore.lrange itemsGetFunction(meetingID, presentationID, pageID), 0, -1, (err, itemIDs) =>
      registerResponse "getItems", err, itemIDs, "getting items for #{meetingID}, #{presentationID}, #{pageID}"
      callback?([]) if itemCount is 0

      itemIDs.forEach (itemID) =>
        @redisStore.hgetall itemGetFunction(meetingID, presentationID, pageID, itemID), (err, itemHash) ->
          registerResponse "getItems", err, itemHash, "getting item #{meetingID}, #{presentationID}, #{pageID}, #{itemID}"
          items.push itemHash
          itemsDone++
          if itemIDs.length is itemsDone
            callback?(err, items)

  # Get the image filename of a presentation page
  #
  # @param meetingID [string] the ID of the meeting
  # @param presentationID [string] the unique ID of the presentation in the meeting
  # @param pageID [string] the unique ID of the page in the presentation
  # @param callback [Function(err, filename)] the callback function to be called when finished
  getPageImage: (meetingID, presentationID, pageID, callback) ->
    @redisStore.get RedisKeys.getPageImageString(meetingID, presentationID, pageID), (err, filename) ->
      registerResponse "getPageImage", err, filename, "getting page image #{meetingID}, #{presentationID}, #{pageID}"
      callback?(err, filename)

  # Get the current presentation ID for the meeting
  #
  # @param meetingID [string] the ID of the meeting
  # @param callback [Function(err, id)] callback function
  getCurrentPresentationID: (meetingID, callback) ->
    @redisStore.get RedisKeys.getCurrentPresentationString(meetingID), (err, id) ->
      registerResponse "getCurrentPresentationID", err, id, "getting current presentation id for #{meetingID}"
      callback?(err, id)

  # Get the current page of the presentation
  #
  # @param meetingID [string] the ID of the meeting
  # @param presentationID [string] the unique ID of the presentation in the meeting
  # @param callback [Function(err, id)] the callback function to be called when finished
  #
  # @todo it doesn't need to receive `presentationID`, it could be taken from `getCurrentPresentationID`
  # @todo the current page should be the first in the list in redis, but it's not. a new key will be added for it
  getCurrentPageID: (meetingID, presentationID, callback) ->
    # the first element in the pages is always the current page
    @redisStore.lindex RedisKeys.getPagesString(meetingID, presentationID), 0, (err, id) ->
      registerResponse "getCurrentPageID", err, id, "getting current page id for #{meetingID}, #{presentationID}"
      callback?(err, id)

  # Get the path to the current image of a presentation
  #
  # @param meetingID [string] the ID of the meeting
  # @param presentationID [string] the unique ID of the presentation in the meeting
  # @param callback [Function(err, id)] the callback function to be called when finished
  # @todo the current image should be the first in the list in redis, but it's not. a new key will be added for it
  getPathToCurrentImage: (meetingID, callback) ->
    @getCurrentPresentationID meetingID, (err, presentationID) =>
      @getCurrentPageID meetingID, presentationID, (err, pageID) =>
        @getPageImage meetingID, presentationID, pageID, (err, filename) =>
          path = config.presentationImagePath(meetingID, presentationID, filename)
          callback?(err, path)

  # Set the value of the current viewbox for the meeting
  #
  # @param meetingID [string] the ID of the meeting
  # @param viewbox [string] the string representing the viewbox value
  # @param callback [Function(err, reply)] the callback function to be called when finished
  # @todo sets values on redis, should be on bbb-apps
  setViewBox: (meetingID, viewbox, callback) ->
    @redisStore.set RedisKeys.getCurrentViewBoxString(meetingID), viewbox, (err, reply) ->
      registerResponse "setViewBox", err, reply, "setting view box for #{meetingID}, #{viewbox}"
      callback?(err, reply)

  # Get the current viewbox of the meeting
  #
  # @param meetingID [string] the ID of the meeting
  # @param callback [Function(err, viewbox)] the callback function to be called when finished
  getViewBox: (meetingID, callback) ->
    @redisStore.get RedisKeys.getCurrentViewBoxString(meetingID), (err, reply) ->
      registerResponse "getViewBox", err, reply, "getting view box for #{meetingID}"
      callback?(err, JSON.parse(reply))

  # Get the list of meetings from redis
  #
  # @param callback [Function(err, meetings)] the callback function to be called when finished
  #
  # @example Returned meeting array:
  #   [ { meetingID: '183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1383072476983',
  #       externalID: 'Demo Meeting',
  #       meetingName: 'Demo Meeting' } ]
  getMeetings: (callback) ->
    @redisStore.smembers "meetings", (err, meetingids) =>
      registerResponse "getMeetings", err, meetingids
      if meetingids
        index = 0
        resp = []
        f = (err, properties) =>
          if index is meetingids.length
            callback?(err, resp)
          else
            r =
              meetingID: meetingids[index]
              externalID: properties["externalID"]
              meetingName: properties["name"]
            resp.push r
            index += 1
            @redisStore.hgetall "meeting-" + meetingids[index], f

        @redisStore.hgetall "meeting-" + meetingids[index], f
      else
        callback?(null, [])


  # Returns the function for getting the string of a specific item given the name of
  # the item type in redis.
  #
  # @param itemString [string] the name of the item
  # @return [Function] the function used to get the key for a specific item from redis
  # @private
  _getItemStringFunction: (itemString) ->
    functions =
      messages: RedisKeys.getMessageString
      shapes: RedisKeys.getShapeString
      currentshapes: RedisKeys.getShapeString
    functions[itemString]

  # Returns the function for getting the string of all the items given the name of the items
  # in redis
  #
  # @param itemString [string] the name of the item
  # @return [Function] the function used to get the key for the list of specific items in redis
  # @private
  _getItemsStringFunction: (itemString) ->
    functions =
      messages: RedisKeys.getMessagesString
      shapes: RedisKeys.getCurrentShapesString
      currentshapes: RedisKeys.getCurrentShapesString
    functions[itemString]

  # Get the session ID from the public ID of a user
  #
  # @param meetingID [string] the ID of the meeting
  # @param publicID [string] the unique public ID of the user
  # @param callback(sessionID) [Function] callback function
  # @private
  _getSessionIDFromPublicID: (meetingID, publicID, callback) ->
    @redisStore.get RedisKeys.getPublicIDString(meetingID, publicID), (err, sessionID) ->
      registerError("_getSessionIDFromPublicID", err)
      callback?(sessionID)

  # Set the image for a particular page ID
  #
  # @param meetingID [string] the ID of the meeting
  # @param presentationID [string] the unique ID of the presentation in the meeting
  # @param pageID [string] the unique ID of the page in the presentation
  # @param imageName [string] the file name of the image
  # @private
  _setPageImage: (meetingID, presentationID, pageID, imageName, callback) ->
    @redisStore.set RedisKeys.getPageImageString(meetingID, presentationID, pageID), imageName, (err, reply) ->
      registerSuccess("_setPageImage", "set page #{pageID} image to #{imageName}") if reply
      registerError("_setPageImage", err, "couldn't set page #{pageID} image to #{imageName}") if err?
      callback?()

  # Delete a list of items from redis
  #
  # @param meetingID [string] the ID of the meeting
  # @param presentationID [string] the unique ID of the presentation in the meeting
  # @param pageID [string] the unique ID of the page in the presentation
  # @param itemName [string] the type of items being deleted
  # @param callback [Function(err, reply)] the callback function to be called when finished
  # @private
  _deleteItemList: (meetingID, presentationID, pageID, itemName, callback) ->
    @redisStore.del @_getItemsStringFunction(itemName)(meetingID, presentationID, pageID), (err, reply) ->
      registerResponse "_deleteItemList", err, reply, "deleting the list of items: #{itemName}"
      callback?(err, reply)

  # Deletes the items by itemName and an array of itemIDs (use helper).
  #
  # @param meetingID [string] the ID of the meeting
  # @param presentationID [string] the unique ID of the presentation in the meeting
  # @param pageID [pageID] the unique ID of the page in the presentation
  # @param itemName [string] the name of the item
  # @param itemIDs [string] an array of itemIDs to delete
  # @param callback [Function(err, reply)] the callback function to be called when finished
  # @private
  #
  # @todo review if the loop is ok
  # @todo callback should be called after all items are deleted, use a lib like 'async' or other similar
  # @todo add examples of what types of items can be removed
  _deleteItems: (meetingID, presentationID, pageID, itemName, itemIDs, callback) ->
    getString = @_getItemStringFunction(itemName)
    itemIDs.forEach (item) =>
      @redisStore.del getString(meetingID, presentationID, pageID, item), (err, reply) ->
        registerResponse "_deleteItems", err, reply, "deleting the item: #{itemName}"

  # Delete a meeting from redis.
  #
  # @param meetingID [string] the ID of the meeting
  # @param callback [Function(err, reply)] the callback function to be called when finished
  # @private
  _deleteMeeting: (meetingID, callback) ->
    @redisStore.srem RedisKeys.getMeetingsString(), meetingID, (err, reply) ->
      registerResponse "_deleteMeeting", err, reply, "deleting the meeting from the list: #{meetingID}"
      callback?(err, reply)

  # Get the item IDs from the item name
  #
  # @param meetingID [string] the ID of the meeting
  # @param presentationID [string] the unique ID of the presentation in the meeting
  # @param pageID [string] the unique ID of the page in the presentation
  # @param itemName [string] the name of the type of items getting the IDs of
  # @param callback [Function(err, reply)] the callback function to be called when finished
  # @private
  _getItemIDs: (meetingID, presentationID, pageID, itemName, callback) ->
    method = @_getItemsStringFunction(itemName)
    @redisStore.lrange method(meetingID, presentationID, pageID), 0, -1, (err, itemIDs) ->
      registerResponse "_getItemIDs", err, itemIDs
      callback?(err, itemIDs)

  # Get the list of presentation IDs for a meeting
  #
  # @param meetingID [string] the ID of the meeting
  # @param callback [Function(err, ids)] callback called when finished
  # @private
  _getPresentationIDs: (meetingID, callback) ->
    @redisStore.smembers RedisKeys.getPresentationsString(meetingID), (err, presIDs) ->
      registerResponse "_getPresentationIDs", err, presIDs
      callback?(err, presIDs)

  # Checks whether the meeting is running or not
  #
  # @param meetingID [string] the ID of the meeting
  # @param callback [Function(err, isRunning)] callback function returns true if meeting is running
  # @private
  _isMeetingRunning: (meetingID, callback) ->
    @redisStore.sismember RedisKeys.getMeetingsString(), meetingID, (err, reply) ->
      registerResponse "isMeetingRunning", err, reply, "checking if meeting is running #{meetingID}"
      callback?(err, (reply is 1))

  # Delete all page references from a presentation.
  #
  # @param meetingID [string] the ID of the meeting
  # @param presentationID [string] the unique ID of the presentation in the meeting
  # @param callback [Function(err, reply)] the callback function to be called when finished
  # @private
  #
  # @todo why `while`s? and not `for`s?
  # @todo review
  _deletePages: (meetingID, presentationID, callback) ->

    # delete each page image
    @getPageIDs meetingID, presentationID, (err, pageIDs) =>

      pageIDs.forEach (pageID) =>
        # @todo has a callback
        @_deletePageImage meetingID, presentationID, pageID

      # delete list of pages
      @redisStore.del RedisKeys.getPagesString(meetingID, presentationID), (err, reply) =>
        registerResponse "_deletePages", err, reply, "deleting pages from #{meetingID}, #{presentationID}"

        # delete currentpage
        @redisStore.del RedisKeys.getCurrentPageString(meetingID, presentationID), (err, reply) ->
          registerResponse "_deletePages", err, reply, "deleting current page from #{meetingID}, #{presentationID}"
          callback?(err, reply)

  # Delete the reference to the image from a particular presentation page in a meeting
  #
  # @param meetingID [string] the ID of the meeting
  # @param presentationID [string] the unique ID of the presentation in the meeting
  # @param pageID [string] the unique ID of the page in the presentation
  # @param callback [Function(err, reply)] the callback function to be called when finished
  # @private
  _deletePageImage: (meetingID, presentationID, pageID, callback) ->
    @redisStore.del RedisKeys.getPageImageString(meetingID, presentationID, pageID), (err, reply) ->
      registerResponse "_deletePageImage", err, reply, "deleting page image for #{meetingID}, #{presentationID}, #{pageID}"
      callback?(err, reply)

  # Delete all presentation references from the meeting
  #
  # @param meetingID [string] the ID of the meeting
  # @param callback [Function(err, reply)]  callback function
  # @private
  _deletePresentations: (meetingID, callback) ->
    @redisStore.del RedisKeys.getPresentationsString(meetingID), (err, reply) =>
      registerResponse "_deletePresentations", err, reply, "deleting presentatations for #{meetingID}"
      if err?
        callback?(err, reply)
      else
        @redisStore.del RedisKeys.getCurrentPresentationString(meetingID), (err, reply) ->
          registerResponse "_deletePresentations", err, reply, "deleting current presentatation for #{meetingID}"
          callback?(err, reply)

registerError = (method, err, message="") ->
  Logger.error "error on RedisAction##{method}:", message, err if err?

registerSuccess = (method, message="") ->
  Logger.info "success on RedisAction##{method}:", message

registerResponse = (method, err, reply, message="") ->
  Utils.registerResponse "RedisAction##{method}", err, reply, message
