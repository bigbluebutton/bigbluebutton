# Todo
# When a user is to be kicked remove their authorization token from servers

@Router.configure layoutTemplate: 'layout'

@Router.map ->
  @route "login",
    path: "/meeting_id=*"
    action: () ->
      self = @
      Meteor.subscribe 'users', getInSession('meetingId'), ->
        Meteor.subscribe 'chat', getInSession('meetingId'), getInSession("userId"), ->
          Meteor.subscribe 'shapes', getInSession('meetingId'), ->
            Meteor.subscribe 'slides', getInSession('meetingId'), ->
              Meteor.subscribe 'meetings', getInSession('meetingId'), ->
                Meteor.subscribe 'presentations', getInSession('meetingId'), ->
                  
                  # Obtain user info here. for testing. should be moved somewhere else later
                  Meteor.call "getMyInfo", getInSession("userId"), (error, result) ->
                    setInSession("DBID", result.DBID)
                    setInSession("userName", result.name)
                  
                  self.redirect('/')

    onBeforeAction: ()->
      url = location.href 
      console.log "\n\nurl=#{url}\n\n"
      #extract the meeting_id, user_id, auth_token, etc from the uri
      if url.indexOf("meeting_id") > -1 # if the URL is /meeting_id=...&...
        urlParts = url.split("&");

        meetingId = urlParts[0]?.split("=")[1];
        console.log "meetingId=" + meetingId

        userId = urlParts[1]?.split("=")[1];
        console.log "userId=" + userId

        authToken = urlParts[2]?.split("=")[1];
        console.log "authToken=" + authToken

        if meetingId? and userId? and authToken?
          Meteor.call("validateAuthToken", meetingId, userId, authToken)
          Meteor.call('sendMeetingInfoToClient', meetingId, userId)
        else  
          console.log "unable to extract from the URL some of {meetingId, userId, authToken}"
      else
        console.log "unable to extract the required information for the meeting from the URL"
  @route "main",
    path: "/"
    onBeforeAction: ->
      self = @
      # Have to check on the server whether the credentials the user has are valid on db, without being able to spam requests for credentials
      Meteor.subscribe 'users', getInSession('meetingId'), -> # callback for after users have been loaded on client
        Meteor.subscribe 'chat', getInSession('meetingId'), getInSession("userId"), ->
          Meteor.subscribe 'shapes', getInSession('meetingId'), ->
            Meteor.subscribe 'slides', getInSession('meetingId'), ->
              Meteor.subscribe 'meetings', getInSession('meetingId'), ->
                Meteor.subscribe 'presentations', getInSession('meetingId'), ->
                  # Obtain user info here. for testing. should be moved somewhere else later
                  Meteor.call "getMyInfo", getInSession("userId"), (error, result) ->
                    setInSession("DBID", result.DBID)
                    setInSession("userName", result.name)

  @route "logout",
    path: "logout"
