Template.userItem.helpers
  # using handlebars' {{equals}} wasn't working for these some reason, so heres a simple JS function to do it
  compareUserIds: (u1, u2) ->
    u1 is u2

Template.userItem.events
  "click .raiseHand": (event) -> #Meteor.call('userRaiseHand', @_id)

  "click .disableCam": (event) -> #Meteor.call('userToggleCam', @_id, false)

  "click .disableMic": (event) -> #Meteor.call('userToggleMic', @_id, false)

  "click .enableMic": (event) -> #Meteor.call('userToggleMic', @_id, true)

  "click .enableCam": (event) -> #Meteor.call('userToggleCam', @_id, true)

  "click .lowerHand": (event) -> #Meteor.call('userLowerHand', @_id)

  "click .setPresenter": (event) ->
    #do nothing if user is already presenter
    unless @isPresenter
      # find user account for new presenter
      selectedUser = Meteor.Users.findOne(_id:@_id)

      if selectedUser? # search for current presenter
        originalPresenter = Meteor.Users.findOne("user.presenter": true)
        if originalPresenter? # unset old presenter
          Meteor.Users.update {_id: originalPresenter._id},{ $set:{ "user.presenter": false}}

        # set newly selected user as presenter
        Meteor.Users.update {_id: selectedUser._id},{$set:{"user.presenter": true}}

  "click .kickUser": (event) ->
    u = Meteor.Users.findOne({_id:@_id})
    if u?.meetingId? and u?.userId?
      userLogout u.meetingId, u.userId, false

Template.displayOtherUsersControls.events
  "click .disableMic": (event) ->
    event.stopImmediatePropagation()
    #Meteor.call('userToggleMic', @_id, false)
  "click .enableMic": (event) ->
    event.stopImmediatePropagation()
    #Meteor.call('userToggleMic', @_id, true)
  "click .disableCam": (event) ->
    event.stopImmediatePropagation()
    #Meteor.call('userToggleCam', @_id, false)
  "click .enableCam": (event) ->
    event.stopImmediatePropagation()
    #Meteor.call('userToggleCam', @_id, true)

Template.displayOwnControls.events
  "click .disableMic": (event) ->
    event.stopImmediatePropagation()
    #Meteor.call('userToggleMic', @_id, false)
    
  "click .enableMic": (event) ->
    event.stopImmediatePropagation()
    #Meteor.call('userToggleMic', @_id, true)
    
  "click .disableCam": (event) ->
    event.stopImmediatePropagation()
    #Meteor.call('userToggleCam', @_id, false)
    
  "click .enableCam": (event) ->
    event.stopImmediatePropagation()
    #Meteor.call('userToggleCam', @_id, true)
    