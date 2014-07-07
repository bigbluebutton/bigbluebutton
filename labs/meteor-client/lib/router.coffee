Router.configure layoutTemplate: 'layout'

Router.map ->
  @route "login",
    path: "/meeting_id=*"
    action: () ->
      @redirect('/')
      Meteor.subscribe 'users', Session.get('meetingId')
      Meteor.subscribe 'chat', Session.get('meetingId')
      Meteor.subscribe 'shapes', Session.get('meetingId')
      Meteor.subscribe 'slides', Session.get('meetingId')
      @

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

  @route "logout",
    path: "logout"
