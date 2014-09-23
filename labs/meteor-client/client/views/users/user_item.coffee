Template.displayUserIcons.events
  'click .raisedHandIcon': (event) ->
    Meteor.call('userLowerHand', getInSession("meetingId"), @user?.userid, getInSession("userId"))

  'click .muteIcon': (event) ->
    toggleMic @
