# Here we want to extract the meeting_id, user_id, auth_token, etc
# from the uri


Meteor.Router.add {
  '*': (url)->
    console.log ("\n\n thissssssssss is " + JSON.stringify(url) + "\n\n")

    
    urlParts = url.split("&");

    meetingId = urlParts[0].split("=")[1];
    console.log "meetingId=" + meetingId

    userId = urlParts[1].split("=")[1];
    console.log "userId=" + userId

    authToken = urlParts[2].split("=")[1];
    console.log "authToken=" + authToken

    userName = urlParts[3].split("=")[1];
    console.log "userName=" + userName


}
