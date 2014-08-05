# Todo
# When a user is to be kicked remove their authorization token from servers

@Router.configure layoutTemplate: 'layout'

@Router.map ->
  @route "login",
    path: "/meeting_id=*"
    action: () ->
      self = @
      Meteor.subscribe 'users', getInSession('meetingId'), ->
        Meteor.subscribe 'chat', getInSession('meetingId'), ->
          Meteor.subscribe 'shapes', getInSession('meetingId'), ->
            Meteor.subscribe 'slides', getInSession('meetingId'), ->
              Meteor.subscribe 'meetings', getInSession('meetingId'), ->
                Meteor.subscribe 'presentations', getInSession('meetingId'), ->
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
          Meteor.call("validate", meetingId, userId, authToken)
          Meteor.call('sendMeetingInfoToClient', meetingId, userId)
        else
          console.log "unable to extract from the URL some of {meetingId, userId, authToken}"
      else
        console.log "unable to extract the required information for the meeting from the URL"
  @route "main",
    path: "/"
    onBeforeAction: ->
      self = @
      Meteor.subscribe 'users', getInSession('meetingId'), -> # callback for after users have been loaded on client
        if not validateCredentials() # Don't let user in if they are not valid
          self.redirect("logout")
        else
          Meteor.subscribe 'chat', getInSession('meetingId'), ->
            Meteor.subscribe 'shapes', getInSession('meetingId'), ->
              Meteor.subscribe 'slides', getInSession('meetingId'), ->
                Meteor.subscribe 'meetings', getInSession('meetingId'), ->
                  Meteor.subscribe 'presentations', getInSession('meetingId')

  @route "logout",
    path: "logout"

@validateCredentials = ->
  u = Meteor.Users.findOne({"userId":getInSession("userId")})
  # return whether they are a valid user and still have credentials in the database
  u? and u.meetingId? and u.user?.extern_userid and u.user?.userid #and (1 is 2) # makes validation fail
