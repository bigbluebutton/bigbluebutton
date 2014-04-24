define [
  'jquery',
  'underscore',
  'backbone',
  'globals',
], ($, _, Backbone, globals) ->

  AuthenticationModel = Backbone.Model.extend
    #url: '/auth'
    defaults:
      username: null
      meetingId: null
      userId: null
      loginAccepted: false

    authenticate: (callbacks) ->
      # TOOD: request to /bigbluebutton/api/enter to get the meeting information
      @username = "Test Name"
      @meetingId = "183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1398367421601"
      @userId = "12345678901234567890234567890"

      message =
        "header":
          "timestamp": new Date().getTime()
          "name": "validate_auth_token_request"
        "payload":
          "auth_token": @userId
          "user_id": @userId
          "meeting_id": @meetingId

      console.log "Sending authentication message", message
      globals.events.on "message", (received) ->
        if received?.header?.name is "validate_auth_token_reply"
          callbacks(null, received)
      globals.connection.emit(message)

  AuthenticationModel
