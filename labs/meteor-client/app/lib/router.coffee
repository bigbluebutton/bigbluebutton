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

        applyNewSessionVars = ->
          setInSession("authToken", authToken)
          setInSession("meetingId", meetingId)
          setInSession("userId", userId)
          Router.go('/')

        clearSessionVar(applyNewSessionVars)

  @route "main",
    path: "/"
    onBeforeAction: ->
      console.log "in main. onBeforeAction"
      authToken = getInSession 'authToken'
      meetingId = getInSession 'meetingId'
      userId = getInSession 'userId'
      console.log "currently #{authToken} #{meetingId} #{userId}"
      Meteor.subscribe 'chat', meetingId, userId, authToken, ->
        Meteor.subscribe 'shapes', meetingId, ->
          Meteor.subscribe 'slides', meetingId, ->
            Meteor.subscribe 'meetings', meetingId, ->
              Meteor.subscribe 'presentations', meetingId, ->
                Meteor.subscribe 'users', meetingId, userId, authToken, ->
                  console.log "done subscribing"
                  onLoadComplete()
      @render('main')
