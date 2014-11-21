
@Router.configure layoutTemplate: 'layout'

@Router.map ->
  @route "login",
    path: "/login"
    action: ->
      meetingId = @params.query.meeting_id
      userId = @params.query.user_id
      authToken = @params.query.auth_token

      if meetingId? and userId? and authToken?
        Meteor.call("validateAuthToken", meetingId, userId, authToken)
        setInSession("authToken", authToken)
        setInSession("meetingId", meetingId)
        setInSession("userId", userId)

        if Meteor.isClient #TODO try to get rid of this
          sendMeetingInfoToClient(meetingId, userId) #TODO try to get rid of this

        Meteor.subscribe 'users', meetingId, userId, authToken, ->
          console.log "now I have access to the users from the client. my userid is #{userId} _#{Meteor.Users.find().count()}__"
          Meteor.subscribe 'chat', meetingId, userId, authToken, ->
            console.log "ready"
            Router.go('/')

  @route "main",
    path: "/"
    onBeforeAction: ->
      console.log "in main. onBeforeAction"
      authToken = getInSession 'authToken'
      meetingId = getInSession 'meetingId'
      userId = getInSession 'userId'
      Meteor.subscribe 'chat', meetingId, userId, authToken, ->
        Meteor.subscribe 'shapes', meetingId, ->
          Meteor.subscribe 'slides', meetingId, ->
            Meteor.subscribe 'meetings', meetingId, ->
              Meteor.subscribe 'presentations', meetingId, ->
                Meteor.subscribe 'users', meetingId, userId, authToken, ->
                  console.log "done subscribing"
      @render('main')

    action: ->
      console.log "main. action"

  @route "logout",
    path: "logout"
