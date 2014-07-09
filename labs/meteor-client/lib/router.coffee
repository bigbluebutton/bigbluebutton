Router.configure layoutTemplate: 'layout'

Router.map ->
  @route "login",
    path: "/meeting_id=*"
    action: () ->
      @redirect('/')
      Meteor.subscribe 'users', Session.get('meetingId')
      Meteor.subscribe 'chat', Session.get('meetingId')
      Meteor.subscribe 'chatTabs', Session.get('userId')

      # I have no idea where to put this
      Meteor.ChatTabs.insert({isActive:true, name:"Public", class: "publicChatTab", 'belongsTo': Session.get("userId")})
      Meteor.ChatTabs.insert({isActive:false, name:"Options", class: "optionsChatTab", 'belongsTo': Session.get("userId")})

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

        userName = urlParts[3]?.split("=")[1];
        console.log "userName=" + userName
        if meetingId? and userId? and authToken? and userName?
          Meteor.call("validate", meetingId, userId, authToken)
          Meteor.call('sendMeetingInfoToClient', meetingId, userId)
        else
          console.log "unable to extract from the URL some of {meetingId, userName, userId, authToken}"
      else
        console.log "unable to extract the required information for the meeting from the URL"
  @route "main",
    path: "/"

  @route "logout",
    path: "logout"
