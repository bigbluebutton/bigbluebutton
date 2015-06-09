@Router.configure layoutTemplate: 'layout'

@Router.map ->
  # this is how we handle login attempts
  @route "main",
    path: "/html5client/:meeting_id/:user_id/:auth_token"
    onBeforeAction: ->
      meetingId = @params.meeting_id
      userId = @params.user_id
      authToken = @params.auth_token

      # catch if any of the user's meeting data is invalid
      if not authToken? or not meetingId? or not userId?
        # if their data is invalid, redirect the user to the logout page
        document.location = getInSession 'logoutURL'

      else
        Meteor.call("validateAuthToken", meetingId, userId, authToken)

        applyNewSessionVars = ->
          setInSession("authToken", authToken)
          setInSession("meetingId", meetingId)
          setInSession("userId", userId)
          Router.go('/html5client')

        clearSessionVar(applyNewSessionVars)

      @next()


  # the user successfully logged in
  @route "signedin",
    path: "/html5client"
    action: ->
      meetingId = getInSession "meetingId"
      userId = getInSession "userId"
      authToken = getInSession "authToken"

      onErrorFunction = (error, result) ->
        console.log "ONERRORFUNCTION"
        #if error
        #  # Was unable to authorize the user. Redirect to the home page
        #  # alert error.reason

        #make sure the user is not let through
        Meteor.call("userLogout", meetingId, userId, authToken)

        clearSessionVar (alert "Please sign in again")
        document.location = getInSession('logoutURL') or '/'
        return

      Meteor.subscribe 'chat', meetingId, userId, authToken, onError: onErrorFunction, onReady: =>
        Meteor.subscribe 'shapes', meetingId, onReady: =>
          Meteor.subscribe 'slides', meetingId, onReady: =>
            Meteor.subscribe 'meetings', meetingId, onReady: =>
              Meteor.subscribe 'presentations', meetingId, onReady: =>
                Meteor.subscribe 'users', meetingId, userId, authToken, onError: onErrorFunction, onReady: =>
                  Meteor.subscribe 'whiteboard-clean-status', meetingId, onReady: =>
                    # done subscribing
                    onLoadComplete()

                    handleLogourUrlError = () ->
                      alert "Error: could not find the logoutURL"
                      setInSession("logoutURL", document.location.hostname)
                      return

                    # obtain the logoutURL
                    a = $.ajax({dataType: 'json', url: '/bigbluebutton/api/enter'})
                    a.done (data) ->
                      if data.response.logoutURL? # for a meeting with 0 users
                        setInSession("logoutURL", data.response.logoutURL)
                        return
                      else
                        if data.response.logoutUrl? # for a running meeting
                          setInSession("logoutURL", data.response.logoutUrl)
                          return
                        else
                          handleLogourUrlError()

                    a.fail (data, textStatus, errorThrown) ->
                      handleLogourUrlError()

      @render('main')


  # endpoint - is the html5client running (ready to handle a user)
  @route 'meteorEndpoint',
    path: '/check'
    where: 'server'
    action: ->
      @response.writeHead 200, 'Content-Type': 'application/json'

      # reply that the html5client is running
      @response.end JSON.stringify {"html5clientStatus":"running"}
      return
  return
