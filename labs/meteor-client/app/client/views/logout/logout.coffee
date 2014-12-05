Template.logout.events
  'click #reconnectButton': (event) ->
    str = "#{Meteor.config.app.serverIP}:#{Meteor.config.app.htmlClientPort}/login?meeting_id=#{__meetingId}&user_id=#{__userId}&auth_token=#{__authToken}"
    #console.log "here the values are:#{@__meetingId} #{@__userId} #{@__authToken}"
    #console.log str
    Router.go str


Template.logout.rendered = =>
  tempStore = =>
    @__meetingId = getInSession('meetingId')
    @__userId = getInSession('userId')
    @__authToken = getInSession('authToken')

  clearSessionVar(tempStore())
