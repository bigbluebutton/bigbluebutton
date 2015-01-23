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

      # catch if any of the user's meeting data is invalid
      if not authToken? or not meetingId? or not userId?
        # if their data is invalid, redirect the user to the logout url
        # logout url is the server ip address at port 4000, bringing the user back
        # to the login page
        document.location = Meteor.config.app.logOutUrl

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
