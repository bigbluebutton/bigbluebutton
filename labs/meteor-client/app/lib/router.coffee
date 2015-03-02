@Router.configure layoutTemplate: 'layout'

@Router.map ->

  @route "main",
    path: "/html5client"
    onBeforeAction: ->

      meetingId = @params.query.meeting_id
      userId = @params.query.user_id
      authToken = @params.query.auth_token

      # catch if any of the user's meeting data is invalid
      if not authToken? or not meetingId? or not userId?
        # if their data is invalid, redirect the user to the logout url
        # logout url is the server ip address at port 4000, bringing the user back
        # to the login page
        document.location = Meteor.config.app.logOutUrl

      else
        Meteor.call("validateAuthToken", meetingId, userId, authToken)

        applyNewSessionVars = ->
          setInSession("authToken", authToken)
          setInSession("meetingId", meetingId)
          setInSession("userId", userId)

        clearSessionVar(applyNewSessionVars)


      onErrorFunction = (error, result) ->
        console.log "ONERRORFUNCTION"
        #if error
        #  # Was unable to authorize the user. Redirect to the home page
        #  # alert error.reason
        #  clearSessionVar alert "Please sign in again"
        #  document.location = Meteor.config.app.logOutUrl
        return

      Meteor.subscribe 'chat', meetingId, userId, authToken, onError: onErrorFunction, onReady: =>
        Meteor.subscribe 'shapes', meetingId, onReady: =>
          Meteor.subscribe 'slides', meetingId, onReady: =>
            Meteor.subscribe 'meetings', meetingId, onReady: =>
              Meteor.subscribe 'presentations', meetingId, onReady: =>
                Meteor.subscribe 'users', meetingId, userId, authToken, onError: onErrorFunction, onReady: =>
                  # done subscribing
                  onLoadComplete()
                  @render('main')
      @next()
