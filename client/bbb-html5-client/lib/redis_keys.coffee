config = require("../config")

# Contains methods to get the keys used to store all the data on redis.
module.exports = class RedisKeys
  constructor: () ->

  # Get the key for the list of meetings
  # TODO: apparently this key is empty on redis
  #
  # @return {string} the key for the list of meetings
  @getMeetingsString: ->
    "meetings"

  # Get the key for a meeting given the meetingID
  # Example:
  #   meeting-183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1377825865370
  #
  # @param  {string} meetingID the ID of the meeting
  # @return {string}           the key for the meeting given the meetingID in redis
  @getMeetingString: (meetingID) ->
    "meeting-#{meetingID}"

  # Get the string representing the key for the hash of all the users for a specified meetingID
  # Example:
  #   meeting-183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1377825865370-users
  #
  # @param  {string} meetingID the ID of the meeting
  # @return {string}           the key for the hash of all the users for a specified meetingID
  @getUsersString: (meetingID) ->
    "meeting-#{meetingID}-users"

  # Get the string representing the key for a specific user
  # Example:
  #   meeting-183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1377825865370-user-dtmvlbro12sw
  #
  # @param  {string} meetingID the ID of the meeting
  # @param  {string} sessionID the sessionID (unique ID) of the user
  # @return {string}           the key for a specific user
  @getUserString: (meetingID, sessionID) ->
    "meeting-#{meetingID}-user-#{sessionID}"

  # Get the string representing the key for the list of current users in a specific meeting
  # Example:
  #   meeting-183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1377825865370-current-users
  #
  # @param  {string} meetingID the ID of the meeting
  # @return {string}           key for the list of current users in a specific meeting ID
  @getCurrentUsersString: (meetingID) ->
    "meeting-#{meetingID}-currentusers"

  # Get the key for the hash that contains all the messages for a specified meeting.
  # Some parameters are not used but are kept in here to maintain the signature equal to
  # the signature of other methods, see `_getItemsStringFunction`.
  # Example:
  #   meeting-183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1377825865370-messages
  #
  # @param  {string} meetingID      the ID of the meeting
  # @param  {string} presentationID not used
  # @param  {string} pageID         not used
  # @return {string}                the key for the hash of all the messages for a specified meeting
  @getMessagesString: (meetingID, presentationID, pageID) ->
    "meeting-#{meetingID}-messages"

  # Get the key for a specific message in a meeting.
  # Some parameters are not used but are kept in here to maintain the signature equal to
  # the signature of other methods, see `_getItemStringFunction`.
  # Example:
  #   meeting-183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1377825865370-message-5a2ab76cfaba1d32b40296f20317eb67
  #
  # @param  {string} meetingID      the ID of the meeting
  # @param  {string} presentationID not used
  # @param  {string} pageID         not used
  # @param  {string} messageID      the unique ID of the message in the public chat
  # @return {string}                string representing the key for a specific message
  @getMessageString: (meetingID, presentationID, pageID, messageID) ->
    "meeting-#{meetingID}-message-#{messageID}"

  # Get the key for the list of presentations in a meeting.
  # Example:
  #   meeting-183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1377825865370-presentations
  #
  # @param  {string} meetingID the ID of the meeting
  # @return {string}           key for the list of presentations for a meeting
  @getPresentationsString: (meetingID) ->
    "meeting-#{meetingID}-presentations"

  # Get the key for the pages in a specific presentation in a meeting.
  # Example:
  #   meeting-183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1377825865370-presentation-default-pages
  #
  # @param  {string} meetingID      the ID of the meeting
  # @param  {string} presentationID the unique ID of the presentation in the meeting
  # @return {string}                key for the pages in a specific presentation in a meeting
  @getPagesString: (meetingID, presentationID) ->
    "meeting-#{meetingID}-presentation-#{presentationID}-pages"

  # Get the key for the current presentation of the meeting.
  # Example:
  #   meeting-183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1377825865370-currentpresentation
  #
  # @param  {string} meetingID the ID of the meeting
  # @return {string}           key for the current presentation of the meeting
  @getCurrentPresentationString: (meetingID) ->
    "meeting-#{meetingID}-currentpresentation"

  # Get the key for the current page in the given presentation.
  # Example:
  #   meeting-183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1377825865370-presentation-default-currentpage
  #
  # @param  {string} meetingID      the ID of the meeting
  # @param  {string} presentationID the unique ID of the presentation in the meeting
  # @return {string}                key for the current page in the presentation
  @getCurrentPageString: (meetingID, presentationID) ->
    "meeting-#{meetingID}-presentation-#{presentationID}-currentpage"

  # Get the key for a specific page in a given presentation.
  # Example:
  #   meeting-183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1377825865370-presentation-default-page-1
  #
  # @param  {string} meetingID      the ID of the meeting
  # @param  {string} presentationID the unique ID of the presentation in the meeting
  # @param  {string} pageID         the unique ID of the page in the presentation
  # @return {string}                key of specific page.
  @getPageString: (meetingID, presentationID, pageID) ->
    "meeting-#{meetingID}-presentation-#{presentationID}-page-#{pageID}"

  # Get the key for the image (slide) of a page of a given presentation.
  # Example:
  #   meeting-183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1377825865370-presentation-default-page-1
  #
  # @param  {string} meetingID      the ID of the meeting
  # @param  {string} presentationID the unique ID of the presentation in the meeting
  # @param  {string} pageID         the unique ID of the page in the presentation
  # @return {string}                key of page image.
  @getPageImageString: (meetingID, presentationID, pageID) ->
    "meeting-#{meetingID}-presentation-#{presentationID}-page-#{pageID}-image"

  # Get the key for list of all current shapes for a page of a presentation.
  # Example:
  #   meeting-183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1377825865370-presentation-default-page-1
  #
  # @param  {string} meetingID      the ID of the meeting
  # @param  {string} presentationID the unique ID of the presentation in the meeting
  # @param  {string} pageID         the unique ID of the page in the presentation
  # @return {string}                key for list of current shapes for the page
  @getCurrentShapesString: (meetingID, presentationID, pageID) ->
    "meeting-#{meetingID}-presentation-#{presentationID}-page-#{pageID}-currentshapes"

  # Get the key for a specific shape on page in a presentation.
  # Example:
  #   meeting-183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1377825865370-presentation-default-page-1-shape-1377828228471
  #
  # @param  {string} meetingID      the ID of the meeting
  # @param  {string} presentationID the unique ID of the presentation in the meeting
  # @param  {string} pageID         the unique ID of the page in the presentation
  # @param  {string} shapeID        the unique ID of the shape in the page
  # @return {string}                key for specific shape on page
  @getShapeString: (meetingID, presentationID, pageID, shapeID) ->
    "meeting-#{meetingID}-presentation-#{presentationID}-page-#{pageID}-shape-#{shapeID}"

  # Get the key for the viewbox of a meeting.
  # Example:
  #   meeting-183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1377825865370-viewbox
  #
  # @param  {string} meetingID the ID of the meeting
  # @return {string}           the key for the current viewbox
  @getCurrentViewBoxString: (meetingID) ->
    "meeting-#{meetingID}-viewbox"

  # Get the key for the current tool in a meeting.
  # Example:
  #   meeting-183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1377825865370-currenttool
  #
  # @param  {string} meetingID the ID of the meeting
  # @return {string}           the key for the current tool
  @getCurrentToolString: (meetingID) ->
    "meeting-#{meetingID}-currenttool"

  # Get the key for the presenter.
  # Example:
  #   meeting-183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1377825865370-presenter
  #
  # @param  {string} meetingID the ID of the meeting
  # @return {string}           the key for the presenter
  @getPresenterString: (meetingID) ->
    "meeting-#{meetingID}-presenter"

  # Get the key for the public ID for a user.
  # The value for this key is the user's sessionID.
  # Example:
  #   meeting-183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1377825865370-publicID-1377825894721
  #
  # @param  {string} meetingID the ID of the meeting
  # @param  {string} publicID  the unique public ID of the user
  # @return {string}           the key for the public ID for a user
  @getPublicIDString: (meetingID, publicID) ->
    "meeting-#{meetingID}-publicID-#{publicID}"

  # Get the key for session ID for a user.
  # The value for this key is the user's publicID.
  # Example:
  #   meeting-183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1377825865370-sessionID-2Ar4fnoHlZJEc1aeQmo8ILgv.0xntStlAoonHxfNiN42hdJm6m1EFJUgxjS7m9KPeNd0
  #
  # @param  {string} meetingID the ID of the meeting
  # @param  {string} sessionID the sessionID (unique ID) of the user
  # @return {string}           the key for session ID for a user
  @getSessionIDString: (meetingID, sessionID) ->
    "meeting-#{meetingID}-sessionID-#{sessionID}"

  # Get the key for the width of a page in a presentation.
  # Example:
  #   meeting-183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1377825865370-presentation-default-page-1-width
  #
  # @param  {string} meetingID      the ID of the meeting
  # @param  {string} presentationID the unique ID of the presentation in the meeting
  # @param  {string} pageID         the unique ID of the page in the presentation
  # @return {string}                the key for the width of a page image
  @getPageWidthString: (meetingID, presentationID, pageID) ->
    "meeting-#{meetingID}-presentation-#{presentationID}-page-#{pageID}-width"

  # Get the key for the height of a page in a presentation.
  # Example:
  #   meeting-183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1377825865370-presentation-default-page-1-height
  #
  # @param  {string} meetingID      the ID of the meeting
  # @param  {string} presentationID the unique ID of the presentation in the meeting
  # @param  {string} pageID         the unique ID of the page in the presentation
  # @return {string}                the key for the height of a page image
  @getPageHeightString: (meetingID, presentationID, pageID) ->
    "meeting-#{meetingID}-presentation-#{presentationID}-page-#{pageID}-height"
