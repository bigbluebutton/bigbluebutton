# Todo
# When a user is to be kicked remove their authorization token from servers

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

        if Meteor.isClient #TODO try to get rid of this
          sendMeetingInfoToClient(meetingId, userId) #TODO try to get rid of this

        Meteor.subscribe 'users', meetingId, userId, authToken, ->
          console.log "now I have access to the users from the client. my userid is #{userId}"

          Meteor.call "getMyInfo", meetingId, userId, (error, result) ->
            if result.error?
              alert result.error
              # redirect towards a different page
            else
              console.log "onBeforeAction2"
              setInSession("DBID", result.DBID)
              setInSession("userName", result.name)
              setInSession("userSecret", result.userSecret)
              me = Meteor.Users.findOne({_id:result.DBID})
              console.log "me=" + JSON.stringify me
              if me?
                Router.go('/') #we are sure the user has dbid, userid and exists in the collection
              else
                alert "did not find the user in the collection"

  @route "main",
    path: "/"
    onBeforeAction: ->
      meetingId = getInSession('meetingId')
      userId = getInSession("userId")
      console.log "on /: meetingId=#{meetingId} userId=#{userId} DBID=#{getInSession('DBID')}"
      Meteor.subscribe 'chat', meetingId, userId, getInSession 'authToken', ->
        Meteor.subscribe 'shapes', meetingId, ->
          Meteor.subscribe 'slides', meetingId, ->
            Meteor.subscribe 'meetings', meetingId, ->
              Meteor.subscribe 'presentations', meetingId, ->
                Meteor.subscribe 'users', meetingId, userId, getInSession 'authToken'

      Meteor.call "getMyInfo", meetingId, userId, (error, result) ->
        unless result.error?
          console.log "on /, this is my info #{JSON.stringify result}"
          setInSession("DBID", result.DBID)
          setInSession("userName", result.name)
          #setInSession("userSecret", result.userSecret)

      @next() #TODO maybe we need to wait for the other 2 things above to be complete

  @route "logout",
    path: "logout"
