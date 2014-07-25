# Todo
# When a user is to be kicked remove their authorization token from servers

Router.configure layoutTemplate: 'layout'

Router.map ->
  @route "login",
    path: "/meeting_id=*"
    action: () ->
      self = @
      Meteor.UsersSub = Meteor.subscribe 'users', getInSession('meetingId'), ->
        Meteor.ChatSub = Meteor.subscribe 'chat', getInSession('meetingId'), ->
          Meteor.ShapesSub = Meteor.subscribe 'shapes', getInSession('meetingId'), ->
            Meteor.SlidesSub = Meteor.subscribe 'slides', getInSession('meetingId'), ->
              Meteor.MeetingsSub = Meteor.subscribe 'meetings', getInSession('meetingId'), ->
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
      Meteor.UsersSub = Meteor.subscribe 'users', getInSession('meetingId'), -> # callback for after users have been loaded on client
        if not validateCredentials() # Don't let user in if they are not valid
          console.log "not validated"
          self.redirect("logout")
        else
          console.log "validated user"
          Meteor.ChatSub = Meteor.subscribe 'chat', getInSession('meetingId'), ->
            Meteor.ShapesSub = Meteor.subscribe 'shapes', getInSession('meetingId'), ->
              Meteor.SlidesSub = Meteor.subscribe 'slides', getInSession('meetingId'), ->
                Meteor.MeetingsSub = Meteor.subscribe 'meetings', getInSession('meetingId')

  @route "logout",
    path: "logout"
    onBeforeAction: ->
      # destroy subscriptions and collections
      console.log "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n"
      console.log "----------------------------------"
      console.log "destroying subscriptions"
      Meteor.UsersSub.stop?()
      Meteor.ChatSub.stop?()
      Meteor.ShapesSub.stop?()
      Meteor.SlidesSub.stop?()
      Meteor.MeetingsSub.stop?()
      console.log "----------------------------------"

@validateCredentials = ->
  u = Meteor.Users.findOne({"userId":getInSession("userId")})
  # return whether they are a valid user and still have credentials in the database
  u? and u.meetingId? and u.user?.extern_userid and u.user?.userid #and (1 is 2) # makes validation fail
