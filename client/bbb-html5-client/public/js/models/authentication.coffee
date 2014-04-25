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
      externalMeetingId: null
      userId: null
      loginAccepted: false

    authenticate: (callbacks) ->
      message =
        header:
          timestamp: new Date().getTime()
          name: "validate_auth_token_request"
        payload:
          auth_token: getURLParameter("auth_token")

      console.log "Sending authentication message", message
      globals.events.on "message", (received) =>
        console.log "Authentication response", received
        if received?.header?.name is "validate_auth_token_reply"
          @set("username", received.payload.fullname)
          @set("meetingId", received.payload.meeting_id)
          @set("externalMeetingId", received.payload.external_meeting_id)
          @set("userId", received.payload.user_id)
          callbacks(null, received)
      globals.connection.emit(message)

  getURLParameter = (name) ->
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]")
    regexS = "[\\?&]"+name+"=([^&#]*)"
    regex = new RegExp(regexS)
    results = regex.exec(location.search)
    unless results?
      ""
    else
      decodeURIComponent(results[1].replace(/\+/g, " "))

  AuthenticationModel
