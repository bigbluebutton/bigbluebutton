Template.logout.events
  'click #reconnectButton': (event) ->
    str = "#{Meteor.config.app.serverIP}:#{Meteor.config.app.htmlClientPort}/login?meeting_id=#{getInSession('meetingId')}&user_id=#{getInSession('userId')}&auth_token=#{getInSession('authToken')}"
    clearSessionVar()
    Router.go str
